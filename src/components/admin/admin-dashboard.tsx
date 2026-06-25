import Link from "next/link";

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

function formatPct(value: number) {
  return `${value.toLocaleString("fr-FR")} %`;
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
    <article className={`admin-home-kpi${tone ? ` admin-home-kpi--${tone}` : ""}`}>
      <p className="admin-home-kpi-label">{label}</p>
      <p className="admin-home-kpi-value">{value}</p>
      {hint ? <p className="admin-home-kpi-hint">{hint}</p> : null}
    </article>
  );
}

export function AdminDashboard({ stats }: Props) {
  const { kpis, funnel, usage } = stats;
  const recentCandidates = stats.candidates.slice(0, 8);

  return (
    <AdminDashboardLive generatedAt={stats.generatedAt}>
      <div className="admin-home">
        <header className="card admin-home-hero">
          <div>
            <span className="brand-chip">ACCUEIL ADMIN</span>
            <h1>Vue d&apos;ensemble</h1>
            <p className="muted admin-home-lead">
              Synthèse rapide — stats détaillées et graphiques dans{" "}
              <Link href="/admin/stats" className="admin-inline-link">
                Statistiques
              </Link>
              . MAJ {formatDate(stats.generatedAt)}.
            </p>
          </div>
          <nav className="admin-home-quicklinks" aria-label="Raccourcis admin">
            <Link href="/admin/stats" className="admin-home-quicklink">
              Statistiques
            </Link>
            <Link href="/admin/candidats" className="admin-home-quicklink">
              Candidats
            </Link>
            <Link href="/admin/offres" className="admin-home-quicklink">
              Offres
            </Link>
            <Link href="/admin/audits" className="admin-home-quicklink">
              Audits
              {kpis.auditsPending > 0 ? ` (${kpis.auditsPending})` : ""}
            </Link>
          </nav>
        </header>

        <div className="admin-home-kpi-grid">
          <KpiCard
            label="Inscrits"
            value={kpis.totalAccounts}
            hint={`+${kpis.signupsLast7Days} / 7 j`}
            tone="accent"
          />
          <KpiCard
            label="Pro actifs"
            value={kpis.activeSubscriptions}
            hint={`${kpis.mrrEstimateEur.toLocaleString("fr-FR")} € MRR`}
            tone="success"
          />
          <KpiCard label="Gratuits" value={kpis.freeAccounts} />
          <KpiCard
            label="Candidatures"
            value={kpis.applicationsTotal}
            hint={`${kpis.usersWithApplications} users actifs`}
          />
          <KpiCard
            label="Activité 7 j"
            value={usage.activityLast7Days}
            hint="Clics, vues, intérêts…"
            tone="accent"
          />
          <KpiCard label="Intérêts offres" value={usage.totalInterests} />
          <KpiCard
            label="Conversion Pro"
            value={formatPct(kpis.conversionRatePct)}
            hint={`${BILLING_MONTHLY_PRICE_EUR} € / mois`}
            tone="success"
          />
          <KpiCard
            label="Offres publiques"
            value={kpis.publicOffers}
            hint={`${kpis.hiddenOffers} masquée(s)`}
          />
        </div>

        <section className="card admin-home-funnel">
          <h2 className="admin-home-section-title">Funnel en un coup d&apos;œil</h2>
          <ol className="admin-home-funnel-steps">
            <li>
              <span>Inscriptions</span>
              <strong>{funnel.signups}</strong>
            </li>
            <li>
              <span>Onboarding OK</span>
              <strong>
                {funnel.onboardingCompleted}{" "}
                <em className="muted">({formatPct(kpis.activationRatePct)})</em>
              </strong>
            </li>
            <li>
              <span>≥ 1 candidature</span>
              <strong>
                {funnel.engagedUsers}{" "}
                <em className="muted">({formatPct(kpis.engagementRatePct)})</em>
              </strong>
            </li>
            <li>
              <span>Pro actif</span>
              <strong>
                {funnel.proActive}{" "}
                <em className="muted">({formatPct(kpis.conversionRatePct)})</em>
              </strong>
            </li>
          </ol>
        </section>

        <section className="card admin-home-funnel">
          <h2 className="admin-home-section-title">Candidats par étape (kanban)</h2>
          <ul className="admin-home-stage-list">
            <li>
              <span>Nouveaux</span>
              <strong>{usage.kanbanStages.new}</strong>
            </li>
            <li>
              <span>Profil prêt</span>
              <strong>{usage.kanbanStages.profile_ready}</strong>
            </li>
            <li>
              <span>Explore offres</span>
              <strong>{usage.kanbanStages.exploring}</strong>
            </li>
            <li>
              <span>En candidature</span>
              <strong>{usage.kanbanStages.applying}</strong>
            </li>
          </ul>
          <p className="muted small-label">
            <Link href="/admin/candidats" className="admin-inline-link">
              Ouvrir le kanban candidats →
            </Link>
          </p>
        </section>

        <section className="card admin-home-recent">
          <h2 className="admin-home-section-title">
            Derniers inscrits —{" "}
            <Link href="/admin/candidats" className="admin-inline-link">
              tout voir
            </Link>
          </h2>
          {recentCandidates.length === 0 ? (
            <p className="muted">Aucun candidat pour le moment.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>École</th>
                    <th>Métier</th>
                    <th>Profil</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCandidates.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <Link href={`/admin/candidats/${row.id}`} className="admin-inline-link">
                          {row.fullName ?? row.email}
                        </Link>
                      </td>
                      <td>{row.schoolName ?? "—"}</td>
                      <td>{row.targetJob ?? "—"}</td>
                      <td>{row.onboardingCompleted ? "Complet" : "En cours"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminDashboardLive>
  );
}
