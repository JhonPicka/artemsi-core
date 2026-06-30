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

function isLocalHostHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/** Prefer localhost origin in dev so Stripe return URLs stay on the running app. */
export function resolveAppBaseUrl(request?: Request) {
  const configured = getAppBaseUrl().replace(/\/$/, "");

  if (!request || process.env.NODE_ENV !== "development") {
    return configured;
  }

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const { hostname } = new URL(origin);
      if (isLocalHostHostname(hostname)) {
        return origin.replace(/\/$/, "");
      }
    } catch {
      // ignore invalid origin
    }
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) {
    const hostname = host.split(":")[0] ?? "";
    if (isLocalHostHostname(hostname)) {
      const proto = request.headers.get("x-forwarded-proto") ?? "http";
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  }

  return configured;
}
