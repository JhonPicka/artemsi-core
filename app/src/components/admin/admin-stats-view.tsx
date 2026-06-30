import {
  AdminAnalyticsBarChart,
  AdminAnalyticsDonutTable,
  AdminAnalyticsFunnelChart,
  AdminAnalyticsHorizontalBarChart,
  AdminAnalyticsLineChart,
} from "@/components/admin/admin-analytics-charts";
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

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <article className="card admin-stats-kpi">
      <p className="admin-stats-kpi-label">{label}</p>
      <p className="admin-stats-kpi-value">{value}</p>
      {hint ? <p className="muted admin-stats-kpi-hint">{hint}</p> : null}
    </article>
  );
}

export function AdminStatsView({ stats }: Props) {
  const { kpis, charts, funnel, usage } = stats;

  const funnelSteps = [
    { label: "Inscriptions", value: funnel.signups, pct: 100 },
    { label: "Onboarding terminé", value: funnel.onboardingCompleted, pct: kpis.activationRatePct },
    { label: "≥ 1 candidature", value: funnel.engagedUsers, pct: kpis.engagementRatePct },
    { label: "Pro actif", value: funnel.proActive, pct: kpis.conversionRatePct },
  ];

  const kanbanItems = [
    { label: "Nouveaux", count: usage.kanbanStages.new },
    { label: "Profil prêt", count: usage.kanbanStages.profile_ready },
    { label: "Explore offres", count: usage.kanbanStages.exploring },
    { label: "En candidature", count: usage.kanbanStages.applying },
  ];

  const refundLabel =
    kpis.stripeRefundsCount === null
      ? "—"
      : `${kpis.stripeRefundsCount} (${formatPct(kpis.stripeRefundRatePct ?? 0)})`;

  return (
    <AdminDashboardLive generatedAt={stats.generatedAt}>
      <div className="admin-stats-page">
        <header className="card admin-stats-hero">
          <span className="brand-chip">STATISTIQUES</span>
          <h1>Pilotage détaillé</h1>
          <p className="muted">
            Graphiques avec axes et quadrillage — données Supabase + Stripe. Mise à jour :{" "}
            {formatDate(stats.generatedAt)}.
          </p>
        </header>

        <section className="admin-stats-section">
          <h2 className="admin-stats-section-title">Vue d&apos;ensemble</h2>
          <div className="admin-stats-kpi-grid admin-stats-kpi-grid--overview">
            <Kpi label="Inscrits" value={kpis.totalAccounts} hint={`+${kpis.signupsLast7Days} / 7 j`} />
            <Kpi label="Pro actifs" value={kpis.activeSubscriptions} hint={`MRR ${kpis.mrrEstimateEur} €`} />
            <Kpi label="Gratuits" value={kpis.freeAccounts} />
            <Kpi label="Candidatures" value={kpis.applicationsTotal} />
            <Kpi label="Activité 7 j" value={usage.activityLast7Days} hint="Événements trackés" />
            <Kpi label="Intérêts offres" value={usage.totalInterests} />
            <Kpi label="Clics offres 14 j" value={usage.offerClicks} />
            <Kpi
              label="Conversion Pro"
              value={formatPct(kpis.conversionRatePct)}
              hint={`${BILLING_MONTHLY_PRICE_EUR} € / mois`}
            />
          </div>
        </section>

        <section className="admin-stats-section">
          <h2 className="admin-stats-section-title">Tendances (14 jours)</h2>
          <div className="admin-stats-charts-grid">
            <AdminAnalyticsLineChart
              title="Inscriptions par jour"
              items={charts.signupsTrend}
              yAxisLabel="Inscriptions"
              xAxisLabel="Date"
              empty="Pas encore d'inscriptions."
            />
            <AdminAnalyticsLineChart
              title="Activité plateforme par jour"
              items={charts.activityTrend}
              yAxisLabel="Événements"
              xAxisLabel="Date"
              color="#28d39a"
              empty="Aucune activité trackée (migration appliquée ?)."
            />
            <AdminAnalyticsBarChart
              title="Candidatures ajoutées par jour"
              items={charts.applicationsTrend}
              yAxisLabel="Candidatures"
              xAxisLabel="Date"
              color="#5eb8ff"
              empty="Aucune candidature."
            />
            <AdminAnalyticsBarChart
              title="Mises à jour Pro par jour"
              items={charts.proActivationsTrend}
              yAxisLabel="Profils Pro"
              xAxisLabel="Date"
              color="#ffb547"
              empty="Pas de mouvement Pro."
            />
          </div>
        </section>

        <section className="admin-stats-section">
          <h2 className="admin-stats-section-title">Funnel & engagement candidats</h2>
          <div className="admin-stats-charts-grid">
            <AdminAnalyticsFunnelChart title="Funnel produit" steps={funnelSteps} />
            <AdminAnalyticsHorizontalBarChart
              title="Répartition kanban candidats"
              items={kanbanItems}
              xAxisLabel="Candidats"
              yAxisLabel="Étape"
            />
            <AdminAnalyticsHorizontalBarChart
              title="Types d'actions (14 j)"
              items={charts.activityByType}
              xAxisLabel="Occurrences"
              yAxisLabel="Action"
              empty="Aucun événement."
            />
          </div>
        </section>

        <section className="admin-stats-section">
          <h2 className="admin-stats-section-title">Acquisition & profils</h2>
          <div className="admin-stats-charts-grid">
            <AdminAnalyticsDonutTable
              title="Sources d'acquisition"
              items={stats.topAcquisitionSources}
              empty="Sources non renseignées."
            />
            <AdminAnalyticsDonutTable
              title="Niveau d'urgence recherche"
              items={stats.topSearchLevels}
              empty="Niveaux non renseignés."
            />
            <AdminAnalyticsHorizontalBarChart
              title="Métiers les plus recherchés"
              items={stats.topTargetJobs}
              xAxisLabel="Candidats"
              yAxisLabel="Métier"
            />
            <AdminAnalyticsHorizontalBarChart
              title="Régions ciblées"
              items={stats.topRegions}
              xAxisLabel="Candidats"
              yAxisLabel="Région"
            />
          </div>
        </section>

        <section className="admin-stats-section">
          <h2 className="admin-stats-section-title">Monétisation & rétention</h2>
          <div className="admin-stats-kpi-grid admin-stats-kpi-grid--dense">
            <Kpi
              label="Activation onboarding"
              value={formatPct(kpis.activationRatePct)}
              hint={`${kpis.onboardingCompleted} profils`}
            />
            <Kpi
              label="Engagement candidatures"
              value={formatPct(kpis.engagementRatePct)}
              hint={`${kpis.usersWithApplications} users`}
            />
            <Kpi
              label="Churn"
              value={formatPct(kpis.churnRatePct)}
              hint={`${kpis.canceledSubscriptions} résiliés`}
            />
            <Kpi label="Impayés" value={kpis.pastDueSubscriptions} />
            <Kpi label="Payés non activés" value={kpis.paidNotActivated} />
            <Kpi label="Résiliations 30 j" value={kpis.cancellationsLast30Days} />
            <Kpi label="Suppressions 30 j" value={kpis.accountDeletionsLast30Days} />
            <Kpi label="Remboursements 90 j" value={refundLabel} />
            <Kpi label="Clients Stripe" value={kpis.billingCustomersTotal} />
            <Kpi label="Stripe actifs" value={kpis.billingActiveTotal} />
          </div>
          <div className="admin-stats-charts-grid admin-stats-charts-grid--half">
            <AdminAnalyticsDonutTable
              title="Répartition des comptes"
              items={charts.accountTiers.map((s) => ({ label: s.label, count: s.value }))}
            />
            <AdminAnalyticsDonutTable
              title="Statuts abonnement"
              items={charts.subscriptions.map((s) => ({ label: s.label, count: s.value }))}
            />
          </div>
        </section>

        <section className="admin-stats-section">
          <h2 className="admin-stats-section-title">Catalogue offres & ops</h2>
          <div className="admin-stats-kpi-grid admin-stats-kpi-grid--dense">
            <Kpi label="Offres en base" value={kpis.totalOffers} />
            <Kpi label="Offres publiques" value={kpis.publicOffers} />
            <Kpi label="Offres masquées" value={kpis.hiddenOffers} />
            <Kpi label="Signalements liens" value={kpis.linkReportsTotal} />
            <Kpi label="Assignations totales" value={kpis.assignmentsTotal} />
            <Kpi label="Matching 7 j" value={kpis.assignmentsLast7Days} />
            <Kpi label="Audits en attente" value={kpis.auditsPending} />
            <Kpi
              label="Moy. candidatures / jour"
              value={kpis.userAddedOffersDailyAverage}
            />
          </div>
        </section>
      </div>
    </AdminDashboardLive>
  );
}
