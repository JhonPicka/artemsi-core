"use client";

import { useState } from "react";

type OfferReportDeadLinkButtonProps = {
  offerId: string;
  disabled?: boolean;
};

export function OfferReportDeadLinkButton({
  offerId,
  disabled = false,
}: OfferReportDeadLinkButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (disabled || loading) return;

    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/offers/link-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? "Signalement impossible.");
      }
      setMessage(
        data.alreadyReported
          ? "Déjà signalé pour cette offre."
          : data.offerHidden
            ? "Merci. L'offre a été retirée du catalogue."
            : "Merci, nous allons vérifier le lien.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Signalement impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="offer-report-dead-link" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        className="inline-link-button offer-report-link-btn"
        onClick={(event) => void handleClick(event)}
        disabled={disabled || loading}
        title={disabled ? "Offre fictive : signalement désactivé." : undefined}
      >
        {loading ? "Envoi…" : "Signaler un lien mort"}
      </button>
      {message ? <span className="offer-report-feedback muted">{message}</span> : null}
    </span>
  );
}
