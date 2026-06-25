import Link from "next/link";

import type { AdminCandidateDetail } from "@/lib/admin-candidates";
import { USER_ACTIVITY_EVENT_LABELS } from "@/lib/user-activity";

type Props = {
  candidate: AdminCandidateDetail;
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

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function subscriptionLabel(status: string) {
  const map: Record<string, string> = {
    active: "Pro actif",
    inactive: "Gratuit",
    past_due: "Impayé",
    canceled: "Résilié",
  };
  return map[status] ?? status;
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    sent: "Envoyée",
    interview: "Entretien",
    accepted: "Acceptée",
    rejected: "Refusée",
    archived: "Archivée",
    seen: "Vue",
    applied: "Postulée",
  };
  return map[status] ?? status;
}

function stageLabel(stage: string) {
  const map: Record<string, string> = {
    new: "Nouveau",
    profile_ready: "Profil prêt",
    exploring: "Explore les offres",
    applying: "En candidature",
  };
  return map[stage] ?? stage;
}

function payloadDetail(payload: Record<string, unknown>) {
  const title = payload.offerTitle ?? payload.title;
  const company = payload.company;
  const parts = [title, company].filter((v) => typeof v === "string" && v.trim());
  return parts.length ? String(parts.join(" — ")) : null;
}

export function AdminCandidateDetailView({ candidate }: Props) {
  const cv = candidate.documents.find((d) => d.documentType === "cv");
  const coverLetter = candidate.documents.find((d) => d.documentType === "cover_letter");

  return (
    <div className="admin-candidate-detail">
      <header className="admin-candidate-detail-hero card">
        <div className="admin-candidate-detail-hero-copy">
          <p className="muted">
            <Link href="/admin/candidats" className="admin-inline-link">
              ← Retour au kanban
            </Link>
          </p>
          <span className="brand-chip">CANDIDAT</span>
          <h1>{candidate.fullName ?? candidate.email}</h1>
          <p className="admin-candidate-detail-lead">
            {candidate.targetJob ?? "Métier non renseigné"} ·{" "}
            {candidate.schoolName ?? "École non renseignée"}
          </p>
          <div className="admin-candidate-detail-badges">
            <span className="admin-pill">{stageLabel(candidate.stage)}</span>
            <span
              className={
                candidate.subscriptionStatus === "active"
                  ? "admin-pill admin-pill--ok"
                  : "admin-pill"
              }
            >
              {subscriptionLabel(candidate.subscriptionStatus)}
            </span>
            <span className="admin-pill">
              {candidate.onboardingCompleted ? "Profil complet" : "Onboarding en cours"}
            </span>
          </div>
        </div>
        <dl className="admin-candidate-detail-meta">
          <div>
            <dt>Email</dt>
            <dd>{candidate.email}</dd>
          </div>
          <div>
            <dt>Téléphone</dt>
            <dd>{candidate.phone ?? "—"}</dd>
          </div>
          <div>
            <dt>Inscription</dt>
            <dd>{formatDateShort(candidate.createdAt)}</dd>
          </div>
          <div>
            <dt>Dernière activité</dt>
            <dd>{formatDate(candidate.lastActivityAt ?? candidate.updatedAt)}</dd>
          </div>
        </dl>
      </header>

      <div className="admin-candidate-kpi-grid">
        <article className="card admin-candidate-kpi">
          <p className="admin-candidate-kpi-label">Candidatures</p>
          <p className="admin-candidate-kpi-value">{candidate.applicationsCount}</p>
        </article>
        <article className="card admin-candidate-kpi">
          <p className="admin-candidate-kpi-label">Intérêts offres</p>
          <p className="admin-candidate-kpi-value">{candidate.interestsCount}</p>
        </article>
        <article className="card admin-candidate-kpi">
          <p className="admin-candidate-kpi-label">Clics offres</p>
          <p className="admin-candidate-kpi-value">{candidate.offerClicksCount}</p>
        </article>
        <article className="card admin-candidate-kpi">
          <p className="admin-candidate-kpi-label">Offres reçues</p>
          <p className="admin-candidate-kpi-value">{candidate.assignmentsCount}</p>
        </article>
      </div>

      <div className="admin-candidate-detail-grid">
        <section className="card admin-candidate-panel">
          <h2>Ce qu&apos;il recherche</h2>
          <dl className="admin-candidate-fields">
            <div>
              <dt>Métier cible</dt>
              <dd>{candidate.targetJob ?? "—"}</dd>
            </div>
            <div>
              <dt>École</dt>
              <dd>{candidate.schoolName ?? "—"}</dd>
            </div>
            <div>
              <dt>Niveau / domaine</dt>
              <dd>
                {[candidate.studyLevel, candidate.studyDomain].filter(Boolean).join(" · ") || "—"}
              </dd>
            </div>
            <div>
              <dt>Régions</dt>
              <dd>{candidate.regions.length ? candidate.regions.join(", ") : "—"}</dd>
            </div>
            <div>
              <dt>Contrat</dt>
              <dd>
                {[candidate.contractType, candidate.contractDuration, candidate.alternanceRhythm]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </dd>
            </div>
            <div>
              <dt>Début souhaité</dt>
              <dd>
                {candidate.startDate
                  ? formatDateShort(candidate.startDate)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Urgence recherche</dt>
              <dd>{candidate.searchLevel ?? "—"}</dd>
            </div>
            <div>
              <dt>Secteurs préférés</dt>
              <dd>
                {candidate.preferredSectors.length
                  ? candidate.preferredSectors.join(", ")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Source acquisition</dt>
              <dd>{candidate.acquisitionSource ?? "—"}</dd>
            </div>
          </dl>
          {candidate.interestKeywords.length > 0 ? (
            <div className="admin-candidate-keywords">
              <p className="admin-candidate-panel-sub">Mots-clés d&apos;intérêt (jobboard)</p>
              <div className="admin-candidate-keyword-list">
                {candidate.interestKeywords.map((kw) => (
                  <span key={kw} className="admin-pill">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="card admin-candidate-panel">
          <h2>Documents</h2>
          <div className="admin-candidate-docs">
            <article className="admin-candidate-doc">
              <p className="admin-candidate-doc-type">CV</p>
              {cv ? (
                <>
                  <p className="admin-candidate-doc-name">{cv.fileName}</p>
                  <p className="muted small-label">
                    Mis à jour {formatDateShort(cv.uploadedAt)}
                  </p>
                  {cv.signedUrl ? (
                    <a
                      href={cv.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button-link secondary-link"
                    >
                      Télécharger le CV
                    </a>
                  ) : (
                    <p className="error small-label">Lien indisponible</p>
                  )}
                </>
              ) : (
                <p className="muted">Aucun CV actif</p>
              )}
            </article>
            <article className="admin-candidate-doc">
              <p className="admin-candidate-doc-type">Lettre de motivation</p>
              {coverLetter ? (
                <>
                  <p className="admin-candidate-doc-name">{coverLetter.fileName}</p>
                  <p className="muted small-label">
                    Mis à jour {formatDateShort(coverLetter.uploadedAt)}
                  </p>
                  {coverLetter.signedUrl ? (
                    <a
                      href={coverLetter.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button-link secondary-link"
                    >
                      Télécharger la LM
                    </a>
                  ) : (
                    <p className="error small-label">Lien indisponible</p>
                  )}
                </>
              ) : (
                <p className="muted">Aucune LM active</p>
              )}
            </article>
          </div>
        </section>
      </div>

      <section className="card admin-candidate-panel">
        <h2>Offres ajoutées au suivi ({candidate.applications.length})</h2>
        {candidate.applications.length === 0 ? (
          <p className="muted">Aucune candidature enregistrée.</p>
        ) : (
          <div className="admin-candidate-offers-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Poste</th>
                  <th>Entreprise</th>
                  <th>Lieu</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Lien</th>
                </tr>
              </thead>
              <tbody>
                {candidate.applications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.title}</td>
                    <td>{app.company ?? "—"}</td>
                    <td>{app.location ?? "—"}</td>
                    <td>
                      <span className="admin-pill">{statusLabel(app.status)}</span>
                    </td>
                    <td>{formatDateShort(app.appliedAt)}</td>
                    <td>
                      {app.url ? (
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-inline-link"
                        >
                          Voir
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="admin-candidate-detail-grid">
        <section className="card admin-candidate-panel">
          <h2>Centres d&apos;intérêt ({candidate.interests.length})</h2>
          {candidate.interests.length === 0 ? (
            <p className="muted">Aucun « Ça m&apos;intéresse » sur le jobboard.</p>
          ) : (
            <ul className="admin-candidate-offer-list">
              {candidate.interests.map((item) => (
                <li key={item.offerId}>
                  <strong>{item.title}</strong>
                  <span className="muted">
                    {[item.company, item.location].filter(Boolean).join(" · ") || "—"}
                  </span>
                  <span className="muted small-label">{formatDateShort(item.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card admin-candidate-panel">
          <h2>Offres assignées ({candidate.assignments.length})</h2>
          {candidate.assignments.length === 0 ? (
            <p className="muted">Aucune offre « Pour toi ».</p>
          ) : (
            <ul className="admin-candidate-offer-list">
              {candidate.assignments.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong>
                  <span className="muted">
                    {[item.company, item.location].filter(Boolean).join(" · ") || "—"}
                  </span>
                  <span className="admin-pill">{statusLabel(item.status)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card admin-candidate-panel">
        <h2>Activité récente</h2>
        {Object.keys(candidate.activitySummary).length > 0 ? (
          <div className="admin-candidate-activity-summary">
            {Object.entries(candidate.activitySummary).map(([type, count]) => (
              <span key={type} className="admin-pill">
                {USER_ACTIVITY_EVENT_LABELS[type] ?? type} · {count}
              </span>
            ))}
          </div>
        ) : null}
        {candidate.recentActivity.length === 0 ? (
          <p className="muted">Pas encore d&apos;événements trackés.</p>
        ) : (
          <ol className="admin-candidate-timeline">
            {candidate.recentActivity.map((event) => {
              const detail = payloadDetail(event.payload);
              return (
                <li key={event.id}>
                  <div className="admin-candidate-timeline-dot" aria-hidden="true" />
                  <div>
                    <p className="admin-candidate-timeline-label">{event.label}</p>
                    {detail ? <p className="muted small-label">{detail}</p> : null}
                    <p className="muted small-label">{formatDate(event.createdAt)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
