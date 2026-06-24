import Link from "next/link";

import { AssignmentOffersPanel } from "@/components/dashboard/assignment-offers-panel";
import type {
  ActivationStep,
  DailyAction,
  DailyApplicationPoint,
  DailyCount,
  Momentum,
} from "@/lib/dashboard-stats";

type Kpi = {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "accent" | "success" | "warning";
};

type PipelineStep = { label: string; value: number; variant: string };

type Activation = {
  steps: ActivationStep[];
  doneCount: number;
  total: number;
  percent: number;
};

type Props = {
  firstName: string | null;
  heroSubtitle: string;
  documentsCount: number;
  publicOffersCount: number;
  kpi: Kpi[];
  assignmentSeries: DailyCount[];
  applicationChartSeries: DailyApplicationPoint[];
  applicationChartMonthLabel: string;
  pipeline: PipelineStep[];
  applicationHotWeek: number;
  momentum: Momentum;
  activation: Activation;
  todayActions: DailyAction[];
  nextAuditLabel: string | null;
  nextAuditDetail: string | null;
};

export function DashboardOverview({
  firstName,
  heroSubtitle,
  documentsCount,
  publicOffersCount,
  kpi,
  assignmentSeries,
  applicationChartSeries,
  applicationChartMonthLabel,
  pipeline,
  applicationHotWeek,
  momentum,
  activation,
  todayActions,
  nextAuditLabel,
  nextAuditDetail,
}: Props) {
  const showActivation = activation.doneCount < activation.total;

  return (
    <div className="dash-wrap">
      <header className="dash-hero">
        <div className="dash-hero-top">
          <p className="dash-kicker">Tableau de bord</p>
          <p className="dash-date" suppressHydrationWarning>
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span
          className={`dash-momentum is-${momentum.tone === "up" ? "up" : momentum.tone === "down" ? "down" : "flat"}`}
        >
          {momentum.tone === "up" ? "↑" : momentum.tone === "down" ? "↓" : "→"} {momentum.label}
        </span>
        <h1 className="dash-hero-title">
          Bonjour{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="dash-hero-sub">{heroSubtitle}</p>
        <div className="dash-hero-cta">
          <Link className="button-link" href="/dashboard/offres">
            Voir mes offres
          </Link>
          <Link className="button-link secondary-link" href="/dashboard/candidatures">
            Mes candidatures
          </Link>
        </div>
      </header>

      {showActivation ? (
        <section className="dash-activation" aria-label="Étapes d'activation">
          <div className="dash-activation-head">
            <h2 className="dash-activation-title">Lance ton compte ARTEMSI</h2>
            <div className="dash-activation-progress">
              <span>
                {activation.doneCount}/{activation.total}
              </span>
              <span className="dash-activation-bar" aria-hidden>
                <span style={{ width: `${activation.percent}%` }} />
              </span>
            </div>
          </div>
          <ul className="dash-activation-list">
            {activation.steps.map((step) => (
              <li key={step.id}>
                <Link
                  href={step.href}
                  className={`dash-activation-item${step.done ? " is-done" : ""}`}
                >
                  <span className="check" aria-hidden>
                    ✓
                  </span>
                  <span style={{ flex: 1 }}>{step.label}</span>
                  <span className="arrow" aria-hidden>
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {todayActions.length > 0 ? (
        <section className="card dash-card" aria-label="Actions du jour">
          <div className="dash-card-head">
            <h2 className="dash-block-title">Actions du jour</h2>
            <p className="muted small-label">
              Le minimum à faire aujourd&apos;hui pour avancer.
            </p>
          </div>
          <ul className="dash-activation-list">
            {todayActions.map((action) => (
              <li key={action.id}>
                <Link href={action.href} className="dash-activation-item">
                  <span className="check" aria-hidden>
                    →
                  </span>
                  <span style={{ flex: 1 }}>{action.label}</span>
                  <span className="arrow" aria-hidden>
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="card dash-card dash-card--panel">
        <AssignmentOffersPanel
          series={assignmentSeries}
          applicationChartSeries={applicationChartSeries}
          applicationChartMonthLabel={applicationChartMonthLabel}
          kpi={kpi}
          pipeline={pipeline}
          applicationHotWeek={applicationHotWeek}
          subtitle="Graphique : courbe du mois — candidatures envoyées et retours / entretiens jour par jour."
        />
      </section>

      <section className="card dash-card dash-rail">
        <h2 className="dash-block-title">Raccourcis</h2>
        <div className="dash-rail-grid">
          <Link href="/dashboard/offres" className="dash-rail-tile">
            <span className="dash-rail-t">Offres</span>
            <span className="dash-rail-s muted">Public + personnalisées</span>
            <span className="dash-rail-n">{publicOffersCount} offres publiques</span>
          </Link>
          <Link href="/dashboard/candidatures" className="dash-rail-tile">
            <span className="dash-rail-t">Candidatures</span>
            <span className="dash-rail-s muted">Mise à jour des statuts</span>
            <span className="dash-rail-n">7 jours : {applicationHotWeek}</span>
          </Link>
          <Link href="/dashboard/audit" className="dash-rail-tile">
            <span className="dash-rail-t">Audit / CV / lettre</span>
            <span className="dash-rail-s muted">Prochain rendez-vous</span>
            <span className="dash-rail-n">{nextAuditLabel ?? "À planifier"}</span>
          </Link>
          <Link href="/dashboard/profil" className="dash-rail-tile">
            <span className="dash-rail-t">Profil</span>
            <span className="dash-rail-s muted">CV, lettre, préférences</span>
            <span className="dash-rail-n">{documentsCount} document(s) actif(s)</span>
          </Link>
        </div>
        {nextAuditDetail ? (
          <p className="dash-audit-hint muted">{nextAuditDetail}</p>
        ) : null}
      </section>
    </div>
  );
}
