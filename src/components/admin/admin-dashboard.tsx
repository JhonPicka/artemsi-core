import {
  AdminPieChart,
  AdminProgressBar,
  AdminRankedBars,
  AdminVerticalBars,
} from "@/components/admin/admin-charts";
import { AdminDashboardLive } from "@/components/admin/admin-dashboard-live";
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
    inactive: "Inactif",
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
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "accent" | "success" | "warning";
}) {
  return (
    <article className={`dash-kpi-card${tone ? ` tone-${tone}` : ""}`}>
      <p className="dash-kpi-label">{label}</p>
      <p className="dash-kpi-value">{value}</p>
      {hint ? <p className="dash-kpi-hint">{hint}</p> : null}
    </article>
  );
}

function joinOrDash(values: string[]) {
  return values.length ? values.join(", ") : "—";
}

export function AdminDashboard({ stats }: Props) {
  const { kpis, charts } = stats;

  return (
    <AdminDashboardLive generatedAt={stats.generatedAt}>
      <div className="admin-dashboard">
        <header className="admin-offer-header">
          <span className="brand-chip">STATISTIQUES</span>
          <h1>Vue d&apos;ensemble</h1>
          <p className="muted">
            Données live depuis Supabase — comptes candidats uniquement (hors admin).
            {kpis.auditsPending > 0 ? (
              <>
                {" "}
                <a href="/admin/audits" className="admin-inline-link">
                  {kpis.auditsPending} audit(s) à traiter →
                </a>
              </>
            ) : null}
          </p>
        </header>

        <section className="card admin-growth-panel">
          <h2 className="dash-block-title">Croissance & revenus</h2>
          <div className="admin-kpi-grid">
            <KpiCard label="Inscrits" value={kpis.totalAccounts} tone="accent" />
            <KpiCard
              label="Abonnés actifs"
              value={kpis.activeSubscriptions}
              hint={`Stripe ${kpis.billingActiveTotal}`}
              tone="success"
            />
            <KpiCard
              label="MRR estimé"
              value={`${kpis.mrrEstimateEur.toLocaleString("fr-FR")} €`}
              hint="19,90 € / abonné"
              tone="success"
            />
            <KpiCard label="Nouveaux 7 j" value={kpis.signupsLast7Days} tone="accent" />
            <KpiCard
              label="Non activés"
              value={kpis.paidNotActivated}
              hint="Payés sans profil"
              tone={kpis.paidNotActivated > 0 ? "warning" : undefined}
            />
            <KpiCard
              label="Audits"
              value={kpis.auditsPending}
              tone={kpis.auditsPending > 0 ? "warning" : undefined}
            />
          </div>

          <h3 className="admin-growth-subtitle">Taux de complétion</h3>
          <div className="admin-progress-grid admin-progress-grid--compact">
            <AdminProgressBar
              label="Onboarding OK"
              value={kpis.onboardingCompleted}
              max={kpis.totalAccounts}
              hint="Profils complets"
              tone="success"
            />
            <AdminProgressBar
              label="Abonnement actif"
              value={kpis.activeSubscriptions}
              max={kpis.totalAccounts}
              hint="Payants / inscrits"
              tone="accent"
            />
            <AdminProgressBar
              label="En cours"
              value={kpis.onboardingPending}
              max={kpis.totalAccounts}
              hint="Onboarding incomplet"
              tone="warning"
            />
            <AdminProgressBar
              label="Assign. 7 j"
              value={kpis.assignmentsLast7Days}
              max={Math.max(kpis.assignmentsTotal, 1)}
              hint="Matching récent"
            />
          </div>
        </section>

        <section className="dash-kpi-block">
          <h2 className="dash-block-title">Acquisition & urgence (données onboarding)</h2>
          <div className="admin-charts-grid admin-charts-grid--pies">
            <AdminPieChart
              title="Source ARTEMSI"
              slices={charts.acquisitionSources}
              empty="Aucune source renseignée."
            />
            <AdminPieChart
              title="Niveau de recherche"
              slices={charts.searchLevels}
              empty="Aucun niveau renseigné."
            />
            <AdminPieChart
              title="Candidatures envoyées"
              slices={charts.applicationsSentRanges}
              empty="Aucune donnée."
            />
            <AdminPieChart
              title="Secteurs préférés"
              slices={charts.preferredSectors}
              empty="Aucun secteur."
            />
          </div>
        </section>

        <div className="admin-charts-grid admin-charts-grid--pies">
          <AdminPieChart
            title="Profils candidats"
            slices={charts.profileCompletion}
            empty="Aucun profil inscrit."
          />
          <AdminPieChart
            title="Abonnements"
            slices={charts.subscriptions}
            empty="Aucun abonnement enregistré."
          />
          <AdminPieChart
            title="Types de contrat"
            slices={charts.contractTypes}
            empty="Aucun type renseigné."
          />
          <AdminPieChart
            title="Rythmes alternance"
            slices={charts.alternanceRhythms}
            empty="Aucun rythme renseigné."
          />
        </div>

        <div className="admin-charts-grid admin-charts-grid--bars">
          <AdminVerticalBars
            title="Métiers les plus demandés"
            items={stats.topTargetJobs}
            empty="Aucun métier cible."
          />
          <AdminRankedBars
            title="Régions ciblées"
            items={stats.topRegions}
            empty="Aucune région."
          />
          <AdminRankedBars
            title="Canaux d'acquisition"
            items={stats.topAcquisitionSources}
            empty="Aucun canal."
          />
          <AdminRankedBars
            title="Niveaux d'urgence"
            items={stats.topSearchLevels}
            empty="Aucun niveau."
          />
        </div>

        <section className="dash-kpi-block">
          <h2 className="dash-block-title">Activité produit</h2>
          <div className="dash-kpi-grid">
            <KpiCard label="Offres en base" value={kpis.totalOffers} />
            <KpiCard label="Offres publiques" value={kpis.publicOffers} />
            <KpiCard label="Assignations totales" value={kpis.assignmentsTotal} />
            <KpiCard
              label="Offres ajoutées (users)"
              value={kpis.userAddedOffersTotal}
              hint="Suivi candidatures"
              tone="accent"
            />
            <KpiCard
              label="Moyenne / jour"
              value={kpis.userAddedOffersDailyAverage.toLocaleString("fr-FR")}
              hint="Depuis la 1re offre user"
            />
          </div>
        </section>

        <section className="card admin-dash-panel admin-dash-recent admin-candidates-panel">
          <h2 className="admin-dash-panel-title">
            Tous les candidats ({stats.candidates.length})
          </h2>
          <p className="muted small-label">
            Dernière synchro : {formatDate(stats.generatedAt)} — données complètes onboarding.
          </p>
          {stats.candidates.length === 0 ? (
            <p className="muted small-label">Aucun candidat inscrit pour le moment.</p>
          ) : (
            <>
              <p className="admin-scroll-hint muted small-label">
                Tableau défilable — utilise la molette ou fais glisser horizontalement pour voir
                toutes les colonnes.
              </p>
              <div className="admin-candidates-scroll">
                <table className="admin-table admin-table--candidates">
                <thead>
                  <tr>
                    <th>Inscription</th>
                    <th>Email</th>
                    <th>Nom</th>
                    <th>Tél.</th>
                    <th>École</th>
                    <th>Niveau</th>
                    <th>Domaine</th>
                    <th>Poste</th>
                    <th>Contrat</th>
                    <th>Rythme alt.</th>
                    <th>Secteurs</th>
                    <th>Régions</th>
                    <th>Source</th>
                    <th>Candidatures</th>
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
                      <td>{row.phone ?? "—"}</td>
                      <td>{row.schoolName ?? "—"}</td>
                      <td>{row.studyLevel ?? "—"}</td>
                      <td>{row.studyDomain ?? "—"}</td>
                      <td>{row.targetJob ?? "—"}</td>
                      <td>{row.contractType ?? "—"}</td>
                      <td>
                        {row.alternanceRhythm ?? "—"}
                        {row.alternanceRhythmOther ? ` (${row.alternanceRhythmOther})` : ""}
                      </td>
                      <td>{joinOrDash(row.preferredSectors)}</td>
                      <td>{joinOrDash(row.regions)}</td>
                      <td>
                        {row.acquisitionSource ?? "—"}
                        {row.acquisitionSourceOther ? ` (${row.acquisitionSourceOther})` : ""}
                      </td>
                      <td>{row.applicationsSentRange ?? "—"}</td>
                      <td>{row.searchLevel ?? "—"}</td>
                      <td>{row.onboardingCompleted ? "Complet" : "En cours"}</td>
                      <td>
                        <span
                          className={
                            row.subscriptionStatus === "active"
                              ? "admin-pill admin-pill--ok"
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
