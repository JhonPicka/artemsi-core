import Stripe from "stripe";

import { env } from "@/lib/env";
import { legalConfig } from "@/lib/legal-config";

export function isStripeSecretKeyValid(key: string | undefined) {
  return Boolean(key && /^sk_(test|live)_/.test(key));
}

export function isStripeConfigured() {
  return isStripeSecretKeyValid(env.STRIPE_SECRET_KEY) && Boolean(env.STRIPE_PRICE_ID);
}

/** Active when Stripe price + secret are set and enforcement is not disabled. */
export function isBillingEnforced() {
  if (process.env.BILLING_ENFORCEMENT === "false") {
    return false;
  }
  return isStripeConfigured();
}

export function getStripeClient() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY manquante");
  }
  return new Stripe(env.STRIPE_SECRET_KEY);
}

export function getAppBaseUrl() {
  return env.NEXT_PUBLIC_APP_URL ?? legalConfig.appUrl;
}
