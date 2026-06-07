"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  AUDIT_STATUS_LABEL,
  type AdminAuditRow,
  type AuditBookingStatus,
} from "@/lib/admin-audit";
import { parisDatetimeLocalToISO } from "@/lib/dates-fr";

type Tab = "pending" | "history";

type Props = {
  initialPending: AdminAuditRow[];
  initialUpcoming: AdminAuditRow[];
  initialHistory: AdminAuditRow[];
};

function formatSlot(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

function statusPillClass(status: AuditBookingStatus) {
  switch (status) {
    case "confirmed":
      return "admin-pill admin-pill--ok";
    case "declined":
      return "admin-pill admin-pill--bad";
    case "cancelled":
      return "admin-pill";
    default:
      return "admin-pill admin-pill--warn";
  }
}

function AuditEditor({
  row,
  busy,
  onPatch,
  showStatusActions,
}: {
  row: AdminAuditRow;
  busy: boolean;
  onPatch: (
    id: string,
    body: { action?: "confirm" | "decline" | "reschedule" | "save_notes"; adminNotes?: string; slotStart?: string },
  ) => Promise<void>;
  showStatusActions: boolean;
}) {
  const [adminNotes, setAdminNotes] = useState(row.adminNotes ?? "");
  const [slotLocal, setSlotLocal] = useState(toDatetimeLocalValue(row.slotStart));
  const canReschedule = row.status === "pending" || row.status === "confirmed";

  return (
    <div className="admin-audit-editor">
      <ul className="admin-audit-meta">
        <li>
          <strong>Candidat :</strong> {row.fullName ?? "—"} ({row.userEmail})
        </li>
        {row.targetJob ? (
          <li>
            <strong>Métier :</strong> {row.targetJob}
          </li>
        ) : null}
        {row.phone ? (
          <li>
            <strong>Tél :</strong> {row.phone}
          </li>
        ) : null}
        {row.userNotes ? (
          <li>
            <strong>Message candidat :</strong> {row.userNotes}
          </li>
        ) : null}
        <li className="muted small-label">
          Demandé le {formatSlot(row.createdAt)}
        </li>
      </ul>

      <label className="admin-audit-field-label" htmlFor={`notes-${row.id}`}>
        Compte rendu (visible par le candidat après enregistrement)
      </label>
      <textarea
        id={`notes-${row.id}`}
        className="admin-audit-notes"
        rows={4}
        value={adminNotes}
        onChange={(e) => setAdminNotes(e.target.value)}
        placeholder="Résumé de l'audit, axes d'amélioration, prochaines étapes…"
      />

      {canReschedule ? (
        <>
          <label className="admin-audit-field-label" htmlFor={`slot-${row.id}`}>
            Créneau (reprogrammer)
          </label>
          <input
            id={`slot-${row.id}`}
            type="datetime-local"
            value={slotLocal}
            onChange={(e) => setSlotLocal(e.target.value)}
          />
          <p className="muted small-label">
            Semaine 18h–22h · week-end 10h–14h (heure Paris)
          </p>
        </>
      ) : null}

      <div className="form-actions admin-audit-actions">
        <button
          type="button"
          className="secondary-link"
          disabled={busy}
          onClick={() => onPatch(row.id, { action: "save_notes", adminNotes })}
        >
          Enregistrer le compte rendu
        </button>
        {canReschedule ? (
          <button
            type="button"
            className="secondary-link"
            disabled={busy}
            onClick={() =>
              onPatch(row.id, {
                action: "reschedule",
                slotStart: parisDatetimeLocalToISO(slotLocal),
                adminNotes,
              })
            }
          >
            Reprogrammer
          </button>
        ) : null}
        {showStatusActions ? (
          <>
            <button
              type="button"
              className="secondary-link"
              disabled={busy}
              onClick={() => onPatch(row.id, { action: "decline", adminNotes })}
            >
              Refuser
            </button>
            <button
              type="button"
              className="button-link"
              disabled={busy}
              onClick={() => onPatch(row.id, { action: "confirm", adminNotes })}
            >
              Confirmer
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function AdminAuditsPanel({ initialPending, initialUpcoming, initialHistory }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pending");
  const [pending, setPending] = useState(initialPending);
  const [history, setHistory] = useState(initialHistory);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Resync local state when server-side props change (after router.refresh).
  // Done during render (recommended pattern in React 19) rather than via useEffect.
  const [syncedPending, setSyncedPending] = useState(initialPending);
  const [syncedHistory, setSyncedHistory] = useState(initialHistory);
  if (syncedPending !== initialPending) {
    setSyncedPending(initialPending);
    setPending(initialPending);
  }
  if (syncedHistory !== initialHistory) {
    setSyncedHistory(initialHistory);
    setHistory(initialHistory);
  }

  const historyCount = history.length;

  async function patchAudit(
    id: string,
    body: {
      action?: "confirm" | "decline" | "reschedule" | "save_notes";
      adminNotes?: string;
      slotStart?: string;
    },
  ) {
    setBusyId(id);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/audits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Action impossible.");
        return;
      }

      if (body.action === "confirm" || body.action === "decline") {
        setPending((rows) => rows.filter((r) => r.id !== id));
        setMessage(
          body.action === "confirm"
            ? "Audit confirmé — candidat notifié."
            : "Audit refusé — candidat notifié.",
        );
      } else if (body.action === "reschedule") {
        setMessage("Créneau reprogrammé — candidat notifié.");
      } else {
        setMessage("Compte rendu enregistré.");
      }

      router.refresh();
    } catch {
      setError("Erreur réseau.");
    } finally {
      setBusyId(null);
    }
  }

  const upcomingLabel = useMemo(
    () =>
      initialUpcoming.length > 0 ? (
        <div className="admin-audit-upcoming-block">
          <h3 className="admin-audit-subtitle">Prochains audits confirmés</h3>
          <ul className="admin-audit-upcoming">
            {initialUpcoming.map((row) => (
              <li key={row.id}>
                <span>{formatSlot(row.slotStart)}</span>
                <span className="muted">
                  {row.fullName ?? row.userEmail}
                  {row.targetJob ? ` · ${row.targetJob}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null,
    [initialUpcoming],
  );

  return (
    <section className="admin-dash-audits" id="audits-admin">
      <header className="admin-audit-section-head">
        <h2 className="dash-block-title">Audits</h2>
        <p className="muted small-label">
          Confirmer, refuser, reprogrammer et rédiger le compte rendu.
        </p>
      </header>

      <div className="admin-audit-tabs" role="tablist" aria-label="Sections audits">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "pending"}
          className={tab === "pending" ? "admin-audit-tab is-active" : "admin-audit-tab"}
          onClick={() => setTab("pending")}
        >
          À traiter ({pending.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "history"}
          className={tab === "history" ? "admin-audit-tab is-active" : "admin-audit-tab"}
          onClick={() => setTab("history")}
        >
          Historique ({historyCount})
        </button>
      </div>

      {message ? (
        <p className="admin-offer-info" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="error admin-offer-error" role="alert">
          {error}
        </p>
      ) : null}

      {tab === "pending" ? (
        <div role="tabpanel">
          {pending.length === 0 ? (
            <p className="muted admin-audit-empty">Aucune demande en attente.</p>
          ) : (
            <div className="admin-audit-queue">
              {pending.map((row) => (
                <article key={row.id} className="admin-audit-card">
                  <div className="admin-audit-card-head">
                    <p className="admin-audit-slot">{formatSlot(row.slotStart)}</p>
                    <span className="admin-pill admin-pill--warn">En attente</span>
                  </div>
                  <AuditEditor
                    row={row}
                    busy={busyId === row.id}
                    onPatch={patchAudit}
                    showStatusActions
                  />
                </article>
              ))}
            </div>
          )}
          {upcomingLabel}
        </div>
      ) : (
        <div role="tabpanel" id="audits-historique">
          {history.length === 0 ? (
            <p className="muted admin-audit-empty">Aucun audit dans l&apos;historique.</p>
          ) : (
            <div className="admin-audit-history-list">
              {history.map((row) => (
                <article key={row.id} className="admin-audit-card admin-audit-card--history">
                  <div className="admin-audit-card-head">
                    <p className="admin-audit-slot">{formatSlot(row.slotStart)}</p>
                    <span className={statusPillClass(row.status)}>
                      {AUDIT_STATUS_LABEL[row.status]}
                    </span>
                  </div>
                  <AuditEditor
                    row={row}
                    busy={busyId === row.id}
                    onPatch={patchAudit}
                    showStatusActions={false}
                  />
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
