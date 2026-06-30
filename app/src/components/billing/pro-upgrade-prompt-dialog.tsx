"use client";

import { useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";

import { SubscribeButton } from "@/components/billing/subscribe-button";
import { billingProTrialLine, billingUpgradeCtaLabel } from "@/lib/billing-offer";

type Variant = "exclusive" | "profile";

type Props = {
  variant?: Variant;
  onClose: () => void;
};

function copyForVariant(variant: Variant) {
  if (variant === "profile") {
    return {
      title: "Débloque tout ton espace Pro",
      description:
        "Matching complet, jobboard intégral, candidature sur les offres exclusives ARTEMSI et audit CV.",
    };
  }

  return {
    title: "Candidater sur les offres exclusives",
    description:
      "Les offres exclusives ARTEMSI sont réservées aux abonnés Pro. Upgrade pour postuler avec ton CV et suivre ta candidature.",
  };
}

export function ProUpgradePromptDialog({ variant = "exclusive", onClose }: Props) {
  const { title, description } = copyForVariant(variant);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="pro-upgrade-dialog-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="pro-upgrade-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pro-upgrade-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="pro-upgrade-dialog__close"
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>
        <span className="brand-chip pro-upgrade-dialog__chip">PRO</span>
        <h2 id="pro-upgrade-dialog-title" className="pro-upgrade-dialog__title">
          {title}
        </h2>
        <p className="muted pro-upgrade-dialog__text">{description}</p>
        <ul className="pro-upgrade-dialog__perks">
          <li>Candidature sur toutes les offres exclusives</li>
          <li>Matching complet dans « Pour toi »</li>
          <li>Jobboard intégral + audit CV</li>
        </ul>
        <p className="pro-upgrade-dialog__trial">{billingProTrialLine()}</p>
        <div className="pro-upgrade-dialog__actions">
          <SubscribeButton className="button-link pro-upgrade-dialog__cta">
            {billingUpgradeCtaLabel()}
          </SubscribeButton>
          <Link href="/subscribe" className="button-link secondary-link">
            Voir les détails
          </Link>
        </div>
      </section>
    </div>,
    document.body,
  );
}
