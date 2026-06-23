/** Offre commerciale ARTEMSI — source unique pour checkout et copy marketing. */
export const BILLING_MONTHLY_PRICE_EUR = 19.9;
export const BILLING_TRIAL_DAYS = 7;

export function formatMonthlyPriceLabel() {
  return "19,90";
}

export function billingFreeCtaLabel() {
  return "Commencer gratuitement";
}

export function billingProCtaLabel() {
  return "Passer Pro";
}

/** @deprecated Préférer billingProCtaLabel — conservé pour boutons Stripe existants */
export function billingTrialCtaLabel() {
  return billingProCtaLabel();
}

export function billingTrialShortLabel() {
  return `${BILLING_TRIAL_DAYS} jours gratuits`;
}

export function billingMonthlyPriceLine() {
  return `${formatMonthlyPriceLabel()}\u00a0EUR TTC / mois`;
}

export function billingAfterTrialPriceLine() {
  return `puis ${billingMonthlyPriceLine()}`;
}

export function billingProTrialLine() {
  return `${billingTrialShortLabel()} · ${billingAfterTrialPriceLine()}`;
}

export function billingFreePlanTagline() {
  return "Jobboard + suivi de candidatures";
}
