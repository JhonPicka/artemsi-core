import {
  AdminFunnelSteps,
  AdminPieChart,
  AdminProgressBar,
  AdminRankedBars,
  AdminVerticalBars,
} from "@/components/admin/admin-charts";
import { AdminDashboardLive } from "@/components/admin/admin-dashboard-live";
import { BILLING_MONTHLY_PRICE_EUR } from "@/lib/billing-offer";
import type { AdminDashboardStats } from "@/lib/admin-stats";

type Props = {
  stats: AdminDashboardStats;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function subscriptionLabel(status: string) {
  const map: Record<string, string> = {
    active: "Actif",
    inactive: "Gratuit",
    past_due: "Impayé",
    canceled: "Résilié",
  };
  return map[status] ?? status;
}

function KpiCard({
  label,
  value,
  hint,
  tone,
  hero,
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "accent" | "success" | "warning" | "danger";
  hero?: boolean;
}) {
  return (
    <article
      className={[
        "admin-pilot-kpi",
        tone ? `admin-pilot-kpi--${tone}` : "",
        hero ? "admin-pilot-kpi--hero" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="admin-pilot-kpi-label">{label}</p>
      <p className="admin-pilot-kpi-value">{value}</p>
      {hint ? <p className="admin-pilot-kpi-hint">{hint}</p> : null}
    </article>
  );
}

function joinOrDash(values: string[]) {
  return values.length ? values.join(", ") : "—";
}

function formatPct(value: number) {
  return `${value.toLocaleString("fr-FR")} %`;
}

export function AdminDashboard({ stats }: Props) {
  const { kpis, charts, funnel } = stats;

  const funnelSteps = [
    {
      label: "Inscriptions",
      value: funnel.signups,
      pct: 100,
    },
    {
      label: "Onboarding terminé",
      value: funnel.onboardingCompleted,
      pct: kpis.activationRatePct,
    },
    {
      label: "≥ 1 candidature",
      value: funnel.engagedUsers,
      pct: kpis.engagementRatePct,
    },
    {
      label: "Pro actif",
      value: funnel.proActive,
      pct: kpis.conversionRatePct,
    },
  ];

  const refundLabel =
    kpis.stripeRefundsCount === null
      ? "—"
      : `${kpis.stripeRefundsCount} (${formatPct(kpis.stripeRefundRatePct ?? 0)})`;

  return (
    <AdminDashboardLive generatedAt={stats.generatedAt}>
      <div className="admin-dashboard admin-dashboard--pilot">
        <header className="admin-pilot-hero card">
          <div className="admin-pilot-hero-copy">
            <span className="brand-chip">PILOTAGE</span>
            <h1>Tableau de bord acquisition</h1>
            <p className="muted">
              Métriques live Supabase + Stripe (candidats hors admin). Dernière synchro :{" "}
              {formatDate(stats.generatedAt)}.
              {kpis.auditsPending > 0 ? (
                <>
                  {" "}
                  <a href="/admin/audits" className="admin-inline-link">
                    {kpis.auditsPending} audit(s) à traiter →
                  </a>
                </>
              ) : null}
            </p>
          </div>
          <div className="admin-pilot-hero-kpis">
            <KpiCard
              hero
              label="Inscrits"
              value={kpis.totalAccounts}
              hint={`+${kpis.signupsLast7Days} sur 7 j`}
              tone="accent"
            />
            <KpiCard
              hero
              label="Gratuits"
              value={kpis.freeAccounts}
              hint="Comptes sans Pro actif"
            />
            <KpiCard
              hero
              label="Pro actifs"
              value={kpis.activeSubscriptions}
              hint={`Stripe ${kpis.billingActiveTotal}`}
              tone="success"
            />
            <KpiCard
              hero
              label="MRR estimé"
              value={`${kpis.mrrEstimateEur.toLocaleString("fr-FR")} €`}
              hint={`${BILLING_MONTHLY_PRICE_EUR.toLocaleString("fr-FR")} € / abonné`}
              tone="success"
            />
          </div>
        </header>

        <section className="card admin-pilot-section">
          <h2 className="admin-pilot-section-title">Monétisation & rétention</h2>
          <div className="admin-pilot-kpi-grid">
            <KpiCard
              label="Conversion Gratuit → Pro"
              value={formatPct(kpis.conversionRatePct)}
              hint={`${kpis.activeSubscriptions} / ${kpis.totalAccounts} inscrits`}
              tone="success"
            />
            <KpiCard
              label="Activation onboarding"
              value={formatPct(kpis.activationRatePct)}
              hint={`${kpis.onboardingCompleted} profils complets`}
              tone="accent"
            />
            <KpiCard
              label="Engagement candidatures"
              value={formatPct(kpis.engagementRatePct)}
              hint={`${kpis.usersWithApplications} users actifs`}
            />
            <KpiCard
              label="Taux de churn"
              value={formatPct(kpis.churnRatePct)}
              hint={`${kpis.canceledSubscriptions} résiliés`}
              tone={kpis.churnRatePct > 15 ? "warning" : undefined}
            />
            <KpiCard
              label="Remboursements (90 j)"
              value={refundLabel}
              hint={
                kpis.stripeRefundsCount === null
                  ? "Stripe non configuré côté serveur"
                  : "Volume remboursé / paiements"
              }
              tone={
                (kpis.stripeRefundRatePct ?? 0) > 10
                  ? "danger"
                  : undefined
              }
            />
            <KpiCard
              label="Résiliations 30 j"
              value={kpis.cancellationsLast30Days}
              hint="billing_customers"
              tone={kpis.cancellationsLast30Days > 0 ? "warning" : undefined}
            />
            <KpiCard
              label="Suppressions compte 30 j"
              value={kpis.accountDeletionsLast30Days}
              hint="Feedback RGPD"
            />
            <KpiCard
              label="Impayés"
              value={kpis.pastDueSubscriptions}
              hint="past_due"
              tone={kpis.pastDueSubscriptions > 0 ? "danger" : undefined}
            />
            <KpiCard
              label="Payés non activés"
              value={kpis.paidNotActivated}
              hint="Pro sans onboarding"
              tone={kpis.paidNotActivated > 0 ? "warning" : undefined}
            />
            <KpiCard
              label="Nouveaux 30 j"
              value={kpis.signupsLast30Days}
              hint="Inscriptions"
              tone="accent"
            />
          </div>

          <div className="admin-charts-grid admin-charts-grid--pilot">
            <AdminPieChart
              title="Répartition des comptes"
              slices={charts.accountTiers}
              empty="Aucun compte candidat."
            />
            <AdminPieChart
              title="Statuts abonnement"
              slices={charts.subscriptions}
              empty="Aucun abonnement."
            />
            <AdminFunnelSteps steps={funnelSteps} />
          </div>

          <div className="admin-progress-grid admin-progress-grid--pilot">
            <AdminProgressBar
              label="Onboarding complété"
              value={kpis.onboardingCompleted}
              max={kpis.totalAccounts}
              hint="Étape clé avant matching"
              tone="success"
            />
            <AdminProgressBar
              label="Conversion Pro"
              value={kpis.activeSubscriptions}
              max={kpis.totalAccounts}
              hint="Objectif acquisition"
              tone="accent"
            />
            <AdminProgressBar
              label="Users avec candidature"
              value={kpis.usersWithApplications}
              max={Math.max(kpis.onboardingCompleted, 1)}
              hint="Valeur produit perçue"
            />
          </div>
        </section>

        <section className="card admin-pilot-section">
          <h2 className="admin-pilot-section-title">Acquisition & tendances</h2>
          <div className="admin-charts-grid admin-charts-grid--bars">
            <AdminVerticalBars
              title="Inscriptions / jour (14 j)"
              items={charts.signupsTrend}
              empty="Pas encore d'inscriptions."
            />
            <AdminVerticalBars
              title="Profils Pro mis à jour (14 j)"
              items={charts.proActivationsTrend}
              empty="Pas de mouvement Pro récent."
            />
            <AdminPieChart
              title="Source ARTEMSI"
              slices={charts.acquisitionSources}
              empty="Sources onboarding vides."
            />
            <AdminPieChart
              title="Niveau d'urgence recherche"
              slices={charts.searchLevels}
              empty="Niveaux non renseignés."
            />
          </div>
          <div className="admin-charts-grid admin-charts-grid--bars">
            <AdminRankedBars
              title="Canaux d'acquisition"
              items={stats.topAcquisitionSources}
              empty="Aucun canal."
            />
            <AdminRankedBars
              title="Régions ciblées"
              items={stats.topRegions}
              empty="Aucune région."
            />
            <AdminRankedBars
              title="Métiers les plus demandés"
              items={stats.topTargetJobs}
              empty="Aucun métier."
            />
          </div>
        </section>

        <section className="card admin-pilot-section">
          <h2 className="admin-pilot-section-title">Produit & catalogue</h2>
          <div className="admin-pilot-kpi-grid admin-pilot-kpi-grid--compact">
            <KpiCard label="Offres en base" value={kpis.totalOffers} />
            <KpiCard label="Offres publiques" value={kpis.publicOffers} />
            <KpiCard
              label="Offres masquées"
              value={kpis.hiddenOffers}
              hint="Liens morts"
              tone={kpis.hiddenOffers > 0 ? "warning" : undefined}
            />
            <KpiCard
              label="Signalements liens"
              value={kpis.linkReportsTotal}
              tone={kpis.linkReportsTotal > 0 ? "warning" : undefined}
            />
            <KpiCard label="Assignations" value={kpis.assignmentsTotal} />
            <KpiCard
              label="Matching 7 j"
              value={kpis.assignmentsLast7Days}
              tone="accent"
            />
            <KpiCard label="Candidatures" value={kpis.applicationsTotal} />
            <KpiCard label="Audits en attente" value={kpis.auditsPending} tone="warning" />
            <KpiCard
              label="Clients Stripe"
              value={kpis.billingCustomersTotal}
              hint="Tous statuts confondus"
            />
          </div>
        </section>

        <section className="card admin-dash-panel admin-dash-recent admin-candidates-panel">
          <h2 className="admin-dash-panel-title">
            Tous les candidats ({stats.candidates.length})
          </h2>
          {stats.candidates.length === 0 ? (
            <p className="muted small-label">Aucun candidat inscrit pour le moment.</p>
          ) : (
            <>
              <p className="admin-scroll-hint muted small-label">
                Tableau défilable — fais glisser horizontalement pour voir toutes les colonnes.
              </p>
              <div className="admin-candidates-scroll">
                <table className="admin-table admin-table--candidates">
                  <thead>
                    <tr>
                      <th>Inscription</th>
                      <th>Email</th>
                      <th>Nom</th>
                      <th>Poste</th>
                      <th>Source</th>
                      <th>Recherche</th>
                      <th>Profil</th>
                      <th>Abonnement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.candidates.map((row) => (
                      <tr key={row.id}>
                        <td>{formatDate(row.createdAt)}</td>
                        <td>{row.email}</td>
                        <td>{row.fullName ?? "—"}</td>
                        <td>{row.targetJob ?? "—"}</td>
                        <td>{row.acquisitionSource ?? "—"}</td>
                        <td>{row.searchLevel ?? "—"}</td>
                        <td>{row.onboardingCompleted ? "Complet" : "En cours"}</td>
                        <td>
                          <span
                            className={
                              row.subscriptionStatus === "active"
                                ? "admin-pill admin-pill--ok"
                                : row.subscriptionStatus === "canceled"
                                  ? "admin-pill admin-pill--warn"
                                  : "admin-pill"
                            }
                          >
                            {subscriptionLabel(row.subscriptionStatus)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </AdminDashboardLive>
  );
}
