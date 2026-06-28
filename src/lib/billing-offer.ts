/** Offre commerciale ARTEMSI — source unique pour checkout et copy marketing. */
export const BILLING_MONTHLY_PRICE_EUR = 19.9;
export const BILLING_TRIAL_DAYS = 7;

/** Feature affichée dans le comparatif landing (Gratuit / Pro). */
export type PlanMarketingFeature = {
  label: string;
  included: boolean;
  highlight?: boolean;
};

export function formatMonthlyPriceLabel() {
  return "19,90";
}

export function billingFreeCtaLabel() {
  return "Commencer gratuitement";
}

export function billingProCtaLabel() {
  return "Passer Pro";
}

export function billingUpgradeCtaLabel() {
  return "Upgrade";
}

/** @deprecated Préférer billingProCtaLabel — conservé pour boutons Stripe existants */
export function billingTrialCtaLabel() {
  return billingProCtaLabel();
}

export function billingTrialShortLabel() {
  return `${BILLING_TRIAL_DAYS} jours gratuits`;
}

export function billingMonthlyPriceLine() {
  return `${formatMonthlyPriceLabel()}\u00a0€ / mois`;
}

export function billingAfterTrialPriceLine() {
  return `puis ${billingMonthlyPriceLine()}`;
}

export function billingProTrialLine() {
  return `${billingTrialShortLabel()} · ${billingAfterTrialPriceLine()}`;
}

// ── Plans Gratuit / Pro — copy marketing (3 promesses produit) ───────────────

export function billingFreePlanHeadline() {
  return "Organiser ma recherche";
}

export function billingProPlanHeadline() {
  return "Décrocher mon alternance";
}

export function billingFreePlanTagline() {
  return "Profil, suivi candidatures et aperçu des offres";
}

export function billingProPlanTagline() {
  return "Matching complet, exclusives partenaires et accompagnement humain";
}

export function billingFreeSignupLead() {
  return "Inscription gratuite — crée ton profil, suis tes candidatures et découvre les offres qui te correspondent.";
}

export function billingPlansSectionTitle() {
  return "Gratuit pour organiser. Pro pour être accompagné.";
}

export function billingPlansSectionLead() {
  return "Trois promesses : offres ciblées, candidatures mieux préparées, suivi clair. Le gratuit te permet de démarrer sans carte ; Pro débloque le matching complet, les exclusives et l'accompagnement humain.";
}

export function billingFreePlanMarketingFeatures(): PlanMarketingFeature[] {
  return [
    {
      label: "Suivi candidatures + profil et CV",
      included: true,
    },
    {
      label: "Offres matchées selon ton profil (aperçu)",
      included: true,
    },
    {
      label: "Découvre les offres exclusives partenaires",
      included: true,
    },
    {
      label: "Matching complet + postuler aux exclusives",
      included: false,
    },
    {
      label: "Guides candidat CV/LM par offre",
      included: false,
    },
    {
      label: "3 appels personnalisés de 1 h / mois",
      included: false,
    },
  ];
}

export function billingProPlanMarketingFeatures(): PlanMarketingFeature[] {
  return [
    { label: "Tout le Gratuit", included: true, highlight: true },
    {
      label: "Matching complet sur 100 % du jobboard",
      included: true,
      highlight: true,
    },
    {
      label: "Postule aux exclusives + guides CV/LM par offre",
      included: true,
      highlight: true,
    },
    {
      label: "3 appels personnalisés de 1 h / mois",
      included: true,
      highlight: true,
    },
  ];
}

/** Résumé Gratuit vs Pro pour FAQ et pages info (texte brut). */
export function billingFreeVsProFaqSummary() {
  return {
    free:
      "inscription sans carte — tu organises ta recherche (profil, suivi candidatures, aperçu d'offres matchées et exclusives partenaires)",
    pro: "tu débloques le matching complet, tu postules aux exclusives, tu accèdes aux guides candidat CV/LM et à 3 appels de 1 h par mois avec un humain",
  };
}
