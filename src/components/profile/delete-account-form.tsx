"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ACCOUNT_DELETION_REASONS,
  type AccountDeletionReasonCode,
} from "@/lib/account-deletion";

export function DeleteAccountForm() {
  const router = useRouter();
  const [reasonCode, setReasonCode] = useState<AccountDeletionReasonCode | "">("");
  const [reasonDetail, setReasonDetail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!reasonCode) {
      setError("Choisis une raison avant de continuer.");
      return;
    }
    if (!confirmed) {
      setError("Coche la case de confirmation.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reasonCode,
          reasonDetail: reasonDetail.trim() || undefined,
          confirm: true,
        }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof body.error === "string" ? body.error : "Impossible de supprimer le compte.",
        );
      }

      router.push("/?account_deleted=1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setSubmitting(false);
    }
  }

  return (
    <div className="delete-account-form">
      <p className="delete-account-survey-label">
        Pourquoi quittes-tu ARTEMSI ? <span className="muted">(obligatoire)</span>
      </p>
      <fieldset className="delete-account-reasons">
        <legend className="sr-only">Raison de départ</legend>
        {ACCOUNT_DELETION_REASONS.map((reason) => (
          <label key={reason.code} className="delete-account-reason">
            <input
              type="radio"
              name="deletion-reason"
              value={reason.code}
              checked={reasonCode === reason.code}
              onChange={() => {
                setReasonCode(reason.code);
                setError(null);
              }}
            />
            <span>{reason.label}</span>
          </label>
        ))}
      </fieldset>

      <label className="delete-account-detail-label" htmlFor="deletion-detail">
        Précision <span className="muted">(optionnel)</span>
      </label>
      <textarea
        id="deletion-detail"
        className="delete-account-detail"
        rows={3}
        maxLength={500}
        placeholder="Ex. entreprise trouvée, autre outil utilisé…"
        value={reasonDetail}
        onChange={(event) => setReasonDetail(event.target.value)}
      />

      <label className="delete-account-confirm">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => {
            setConfirmed(event.target.checked);
            setError(null);
          }}
        />
        <span>
          Je comprends que cette action est irréversible et que mes données seront supprimées.
        </span>
      </label>

      {error ? (
        <p className="delete-account-error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        className="delete-account-submit"
        disabled={submitting}
        onClick={() => void handleDelete()}
      >
        {submitting ? "Suppression…" : "Supprimer définitivement mon compte"}
      </button>
    </div>
  );
}
