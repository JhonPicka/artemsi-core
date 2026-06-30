"use client";

import { useState } from "react";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export function ManageSubscriptionButton({ className, children }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Portail indisponible");
      }
      window.location.href = payload.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
      setLoading(false);
    }
  }

  return (
    <span className="subscribe-button-wrap">
      <button type="button" className={className} onClick={handleClick} disabled={loading}>
        {loading ? "Chargement…" : children ?? "Gérer mon abonnement"}
      </button>
      {error ? <span className="error subscribe-button-error">{error}</span> : null}
    </span>
  );
}
