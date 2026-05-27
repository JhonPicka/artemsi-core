import {
  AdminPieChart,
  AdminProgressBar,
  AdminRankedBars,
  AdminVerticalBars,
} from "@/components/admin/admin-charts";
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

export function AdminDashboard({ stats }: Props) {
  const { kpis, charts } = stats;

  return (
    <div className="admin-dashboard">
      <header className="admin-offer-header">
        <span className="brand-chip">STATISTIQUES</span>
        <h1>Vue d&apos;ensemble</h1>
        <p className="muted">
          Mis à jour le {formatDate(stats.generatedAt)} — comptes candidats uniquement (hors admin).
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

      <section className="dash-kpi-block">
        <h2 className="dash-block-title">Indicateurs clés</h2>
        <div className="dash-kpi-grid">
          <KpiCard label="Comptes inscrits" value={kpis.totalAccounts} tone="accent" />
          <KpiCard label="Abonnements actifs" value={kpis.activeSubscriptions} tone="success" />
          <KpiCard label="Nouveaux (7 j)" value={kpis.signupsLast7Days} tone="accent" />
          <KpiCard
            label="Audits en attente"
            value={kpis.auditsPending}
            tone={kpis.auditsPending > 0 ? "warning" : undefined}
          />
        </div>
      </section>

      <section className="card admin-chart-panel">
        <h2 className="dash-block-title">Taux de complétion</h2>
        <div className="admin-progress-grid">
          <AdminProgressBar
            label="Onboarding terminé"
            value={kpis.onboardingCompleted}
            max={kpis.totalAccounts}
            hint="Part des inscrits avec profil complet"
            tone="success"
          />
          <AdminProgressBar
            label="Abonnement actif"
            value={kpis.activeSubscriptions}
            max={kpis.totalAccounts}
            hint="Payants parmi les inscrits"
            tone="accent"
          />
          <AdminProgressBar
            label="Offres publiques"
            value={kpis.publicOffers}
            max={Math.max(kpis.totalOffers, 1)}
            hint="Offres visibles publiquement"
          />
          <AdminProgressBar
            label="Assignations (7 derniers jours)"
            value={kpis.assignmentsLast7Days}
            max={Math.max(kpis.assignmentsTotal, 1)}
            hint="Activité matching récente"
            tone="warning"
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
          title="Domaines d'études"
          slices={charts.studyDomains}
          empty="Aucun domaine renseigné."
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
      </div>

      <section className="dash-kpi-block">
        <h2 className="dash-block-title">Activité produit</h2>
        <div className="dash-kpi-grid">
          <KpiCard label="Offres en base" value={kpis.totalOffers} />
          <KpiCard label="Assignations totales" value={kpis.assignmentsTotal} />
          <KpiCard label="Candidatures suivies" value={kpis.applicationsTotal} />
        </div>
      </section>

      <section className="card admin-dash-panel admin-dash-recent">
        <h2 className="admin-dash-panel-title">Dernières inscriptions</h2>
        {stats.recentSignups.length === 0 ? (
          <p className="muted small-label">Aucun candidat inscrit pour le moment.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Email</th>
                  <th>Nom</th>
                  <th>Métier cible</th>
                  <th>Profil</th>
                  <th>Abonnement</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSignups.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDate(row.createdAt)}</td>
                    <td>{row.email}</td>
                    <td>{row.fullName ?? "—"}</td>
                    <td>{row.targetJob ?? "—"}</td>
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
        )}
      </section>
    </div>
  );
}
