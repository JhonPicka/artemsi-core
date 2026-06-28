"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MouseEvent } from "react";

import { getFreshSignupPath } from "@/lib/auth-paths";
import {
  BILLING_TRIAL_DAYS,
  billingFreeCtaLabel,
  billingMonthlyPriceLine,
} from "@/lib/billing-offer";

const SIGNUP_PATH = getFreshSignupPath();

async function startProCheckout() {
  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const text = await response.text();
  let payload: { url?: string; error?: string };
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error("Erreur serveur inattendue");
  }
  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? "Impossible de démarrer le paiement");
  }
  window.location.assign(payload.url);
}

type Props = {
  className?: string;
  showArrow?: boolean;
};

export function FreeCTAInterceptor({ className, showArrow = true }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const portalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    portalRef.current = document.body;
    setMounted(true);
  }, []);

  // Nettoyage : si le composant est démonté modal ouvert, libère le scroll
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Fermeture avec la touche Échap
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function handleFreeClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    setOpen(true);
    document.body.style.overflow = "hidden";
  }

  function handleClose() {
    setOpen(false);
    document.body.style.overflow = "";
    setError(null);
  }

  function handleConfirmFree() {
    handleClose();
    window.location.assign(SIGNUP_PATH);
  }

  async function handleTryPro() {
    setLoading(true);
    setError(null);
    try {
      await startProCheckout();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
      setLoading(false);
    }
  }

  const modal = open ? (
    <div
      className="free-cta-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="free-cta-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="free-cta-modal">
        <p className="free-cta-modal-eyebrow">Attends une seconde 👀</p>
        <h2 id="free-cta-modal-title" className="free-cta-modal-title">
          Tu es sûr(e) de ne pas vouloir tester le Pro ?
        </h2>
        <p className="free-cta-modal-body">
          Essaie <strong>{BILLING_TRIAL_DAYS} jours gratuitement</strong> — offres ciblées,
          accompagnement humain, dashboard complet.
          <br />
          <span className="free-cta-modal-price">
            Sans engagement · {billingMonthlyPriceLine()} après l&apos;essai
          </span>
        </p>

        {error && (
          <p className="error free-cta-modal-error" role="alert">
            {error}
          </p>
        )}

        <div className="free-cta-modal-actions">
          <button
            type="button"
            className="button-link landing-cta-primary landing-cta-primary--pro free-cta-modal-btn-pro"
            onClick={handleTryPro}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Redirection..." : `Essayer Pro ${BILLING_TRIAL_DAYS} jours gratuits →`}
          </button>
          <button
            type="button"
            className="free-cta-modal-btn-free"
            onClick={handleConfirmFree}
            disabled={loading}
          >
            Non merci, commencer gratuitement
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <a
        href={SIGNUP_PATH}
        className={className}
        onClick={handleFreeClick}
      >
        {billingFreeCtaLabel()}
        {showArrow ? (
          <span className="landing-cta-arrow" aria-hidden="true">
            →
          </span>
        ) : null}
      </a>

      {mounted && portalRef.current
        ? createPortal(modal, portalRef.current)
        : null}
    </>
  );
}
