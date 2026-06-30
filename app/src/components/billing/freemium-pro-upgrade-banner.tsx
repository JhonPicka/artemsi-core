import Link from "next/link";

import { SubscribeButton } from "@/components/billing/subscribe-button";
import {
  billingProCtaLabel,
  billingProTrialLine,
} from "@/lib/billing-offer";

type Variant = "matching" | "hidden-offers" | "exclusives" | "jobboard";

type Props = {
  variant: Variant;
  hiddenCount?: number;
  className?: string;
};

function copyForVariant(variant: Variant, hiddenCount: number) {
  switch (variant) {
    case "matching":
      return {
        title: "Plus d'offres pour toi",
        description: (
          <>
            Aperçu gratuit limité. Passe Pro pour recevoir toutes les offres qui matchent ton profil
            dans <em>Pour toi</em>.
          </>
        ),
      };
    case "hidden-offers":
      return {
        title: `Encore ${hiddenCount} offre${hiddenCount > 1 ? "s" : ""} te correspond${hiddenCount > 1 ? "ent" : ""}`,
        description: "Passe Pro pour les afficher et candidater sans limite sur ton matching.",
      };
    case "exclusives":
      return {
        title: "Candidater sur les offres exclusives",
        description:
          "En compte gratuit, tu peux consulter ces offres mais pas y postuler. Passe Pro pour candidater.",
      };
    case "jobboard":
      return {
        title: "Jobboard complet",
        description:
          "Passe Pro pour accéder à toutes les offres récentes du catalogue et postuler sans limite.",
      };
  }
}

export function FreemiumProUpgradeBanner({ variant, hiddenCount = 0, className }: Props) {
  const { title, description } = copyForVariant(variant, hiddenCount);

  return (
    <aside
      className={["freemium-pro-upgrade-banner", className].filter(Boolean).join(" ")}
      aria-label="Passer Pro"
    >
      <div className="freemium-pro-upgrade-banner__body">
        <span className="brand-chip freemium-pro-upgrade-banner__chip">PRO</span>
        <p className="freemium-pro-upgrade-banner__title">{title}</p>
        <p className="freemium-pro-upgrade-banner__text">{description}</p>
        <p className="freemium-pro-upgrade-banner__trial">{billingProTrialLine()}</p>
      </div>
      <div className="freemium-pro-upgrade-banner__actions">
        <SubscribeButton className="button-link freemium-pro-upgrade-banner__cta">
          {billingProCtaLabel()}
        </SubscribeButton>
        <Link href="/subscribe" className="button-link secondary-link freemium-pro-upgrade-banner__link">
          Voir les détails
        </Link>
      </div>
    </aside>
  );
}
