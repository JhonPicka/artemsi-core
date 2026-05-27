"use client";

import { useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  email?: string;
  disabled?: boolean;
};

async function parseCheckoutResponse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text) as { url?: string; error?: string };
  } catch {
    if (text.includes("env` is defined multiple times")) {
      throw new Error(
        "Erreur de compilation serveur. Arrete npm run dev, supprime app/.next, relance.",
      );
    }
    throw new Error(
      response.ok
        ? "Reponse serveur invalide"
        : `Erreur serveur (${response.status}). Recharge la page ou relance npm run dev.`,
    );
  }
}

export function SubscribeButton({ children, className, email, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email ? { email } : {}),
      });
      const payload = await parseCheckoutResponse(response);
      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Impossible de demarrer le paiement");
      }
      window.location.assign(payload.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
      setLoading(false);
    }
  }

  return (
    <span className="subscribe-button-wrap">
      <button
        type="button"
        className={className}
        onClick={handleClick}
        disabled={disabled || loading}
        aria-busy={loading}
      >
        {loading ? "Redirection..." : children}
      </button>
      {error ? (
        <span className="error subscribe-button-error" role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}
