"use client";

import { useMemo, useState } from "react";

import { ApplicationsMonthChart } from "@/components/dashboard/applications-month-chart";
import type { DailyApplicationPoint, DailyCount } from "@/lib/dashboard-stats";

export type DashboardKpiItem = {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "accent" | "success" | "warning";
};

export type DashboardPipelineStep = {
  label: string;
  value: number;
  variant: string;
};

type Props = {
  series: DailyCount[];
  applicationChartSeries: DailyApplicationPoint[];
  applicationChartMonthLabel: string;
  kpi: DashboardKpiItem[];
  pipeline: DashboardPipelineStep[];
  applicationHotWeek: number;
  title?: string;
  subtitle?: string;
};

type View = "chart" | "numbers";

export function AssignmentOffersPanel({
  series,
  applicationChartSeries,
  applicationChartMonthLabel,
  kpi,
  pipeline,
  applicationHotWeek,
  title = "Synthèse & offres",
  subtitle,
}: Props) {
  const [view, setView] = useState<View>("chart");
  const numbersOn = view === "numbers";

  const hasChartData = applicationChartSeries.some(
    (d) => d.sent > 0 || d.responses > 0,
  );
  const reversedSeries = useMemo(() => [...series].reverse(), [series]);

  return (
    <div className="dash-panel">
      <header className="dash-panel-head">
        <div className="dash-panel-titles">
          <h2 className="dash-panel-title">{title}</h2>
          {subtitle ? <p className="dash-panel-sub">{subtitle}</p> : null}
        </div>

        <div className="dash-panel-toggle" role="group" aria-label="Mode d'affichage">
          <span className={`dash-toggle-side${!numbersOn ? " is-active" : ""}`}>Graphique</span>
          <button
            type="button"
            className="dash-ios-switch"
            data-state={numbersOn ? "on" : "off"}
            onClick={() => setView((v) => (v === "chart" ? "numbers" : "chart"))}
            aria-pressed={numbersOn}
            aria-label={
              numbersOn
                ? "Afficher le graphique des candidatures du mois"
                : "Afficher la vue chiffrée (indicateurs et candidatures)"
            }
          >
            <span className="dash-ios-switch-thumb" aria-hidden />
          </button>
          <span className={`dash-toggle-side${numbersOn ? " is-active" : ""}`}>Chiffres</span>
        </div>
      </header>

      {view === "chart" ? (
        hasChartData ? (
          <ApplicationsMonthChart
            series={applicationChartSeries}
            monthLabel={applicationChartMonthLabel}
            isDemo={false}
          />
        ) : (
          <p className="dash-empty muted">
            Dès que tu ajoutes des candidatures et que tu mets à jour leurs statuts (retour,
            entretien…), la courbe du mois apparaît ici.
          </p>
        )
      ) : (
        <div className="dash-panel-grid">
          <section className="dash-panel-section" aria-label="Indicateurs clés">
            <p className="dash-panel-section-label">Indicateurs clés</p>
            <div className="dash-kpi-grid">
              {kpi.map((item) => (
                <div
                  key={item.label}
                  className={`dash-kpi-card tone-${item.tone ?? "default"}`}
                >
                  <p className="dash-kpi-label">{item.label}</p>
                  <p className="dash-kpi-value">{item.value}</p>
                  <p className="dash-kpi-hint">{item.hint}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="dash-panel-section" aria-label="Candidatures par statut">
            <div className="dash-panel-section-row">
              <p className="dash-panel-section-label">Candidatures par statut</p>
              <p className="dash-panel-section-meta">
                {applicationHotWeek} ajoutée{applicationHotWeek > 1 ? "s" : ""} ces 7 derniers jours
              </p>
            </div>
            <div className="dash-pipeline">
              {pipeline.map((step) => (
                <div key={step.label} className={`dash-pipe-step ${step.variant}`}>
                  <span className="dash-pipe-value">{step.value}</span>
                  <span className="dash-pipe-label">{step.label}</span>
                </div>
              ))}
            </div>
          </section>

          {series.length > 0 ? (
            <details className="dash-panel-details">
              <summary>Offres reçues — détail 14 jours</summary>
              <div className="dash-assign-scroll">
                <table className="dash-assign-table">
                  <thead>
                    <tr>
                      <th scope="col">Jour</th>
                      <th scope="col">Offres reçues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reversedSeries.map((d) => (
                      <tr key={d.day}>
                        <td>{d.label}</td>
                        <td>{d.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ) : null}
        </div>
      )}
    </div>
  );
}
