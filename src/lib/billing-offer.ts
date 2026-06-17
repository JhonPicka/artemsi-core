/** Offre commerciale ARTEMSI — source unique pour checkout et copy marketing. */
export const BILLING_MONTHLY_PRICE_EUR = 19.9;
export const BILLING_TRIAL_DAYS = 10;

export function formatMonthlyPriceLabel() {
  return "19,90";
}

export function billingTrialShortLabel() {
  return `${BILLING_TRIAL_DAYS} jours gratuits`;
}

export function billingTrialCtaLabel() {
  return "Essai gratuit";
}

export function billingMonthlyPriceLine() {
  return `${formatMonthlyPriceLabel()}\u00a0EUR TTC / mois`;
}

export function billingAfterTrialPriceLine() {
  return `puis ${billingMonthlyPriceLine()}`;
}
