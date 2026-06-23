"use client";

import { useState } from "react";

import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/validation";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  sent: "Envoyée",
  interview: "Entretien",
  accepted: "Acceptée",
  rejected: "Refusée",
  archived: "Archivée",
};

const DEMO_APPLICATIONS = [
  {
    id: "dassault",
    title: "Technicien Supply Chain — Apprentissage",
    meta: "Dassault Aviation · Seclin (59) · mardi 26 mai 2026",
    defaultStatus: "interview" as ApplicationStatus,
  },
  {
    id: "safran",
    title: "Chef de projet SRM — Alternance",
    meta: "Safran · Malakoff · vendredi 23 mai 2026",
    defaultStatus: "sent" as ApplicationStatus,
  },
  {
    id: "thales",
    title: "Data Analyst — Alternance",
    meta: "Thales · Meudon · lundi 19 mai 2026",
    defaultStatus: "sent" as ApplicationStatus,
  },
] as const;

type DemoApplicationId = (typeof DEMO_APPLICATIONS)[number]["id"];

export function LandingApplicationTrackerDemo() {
  const [statuses, setStatuses] = useState<Record<DemoApplicationId, ApplicationStatus>>(() =>
    Object.fromEntries(
      DEMO_APPLICATIONS.map((item) => [item.id, item.defaultStatus]),
    ) as Record<DemoApplicationId, ApplicationStatus>,
  );

  return (
    <div className="landing-tracker-demo card">
      <div className="landing-tracker-demo-head">
        <p className="muted landing-tracker-demo-hint">
          Clique un statut pour voir comment tu mets à jour ta candidature.
        </p>
      </div>

      <ul className="applications-list landing-tracker-demo-list">
        {DEMO_APPLICATIONS.map((application) => {
          const status = statuses[application.id];

          return (
            <li key={application.id} className="application-row landing-tracker-demo-row">
              <div className="application-main">
                <div className="application-title">
                  {application.title}
                  <span
                    className="landing-tracker-demo-arrow"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </div>
                <div className="application-meta">{application.meta}</div>
              </div>

              <div className="application-actions">
                <div className="application-chips-desktop status-chips">
                  {APPLICATION_STATUSES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`status-chip status-${item}${status === item ? " is-active" : ""}`}
                      onClick={() =>
                        setStatuses((current) => ({
                          ...current,
                          [application.id]: item,
                        }))
                      }
                      aria-pressed={status === item}
                    >
                      {STATUS_LABEL[item]}
                    </button>
                  ))}
                </div>
                <span className={`application-status-mobile status-pill status-${status}`}>
                  {STATUS_LABEL[status]}
                </span>
                <span className="application-chevron" aria-hidden="true">
                  ›
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
