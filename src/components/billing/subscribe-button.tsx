"use client";

import { useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  email?: string;
  disabled?: boolean;
  /** Affiche un champ email obligatoire avant redirection Stripe. */
  collectEmail?: boolean;
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

export function SubscribeButton({
  children,
  className,
  email: emailProp,
  disabled,
  collectEmail = true,
}: Props) {
  const [emailInput, setEmailInput] = useState(emailProp ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showEmailField = collectEmail && !emailProp;

  async function handleClick() {
    const email = (emailProp ?? emailInput).trim().toLowerCase();
    if (!email.includes("@")) {
      setError("Entre ton email (celui de ton futur compte ARTEMSI).");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
      {showEmailField ? (
        <label className="subscribe-checkout-email-label">
          <span className="subscribe-checkout-email-caption">Email pour ton compte</span>
          <input
            type="email"
            name="checkout-email"
            className="subscribe-checkout-email-input"
            value={emailInput}
            onChange={(event) => setEmailInput(event.target.value)}
            placeholder="ex. prenom@gmail.com"
            autoComplete="email"
            required
          />
        </label>
      ) : null}
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
