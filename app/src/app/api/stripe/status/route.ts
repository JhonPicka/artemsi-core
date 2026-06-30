import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { isStripeConfigured, isStripeSecretKeyValid } from "@/lib/stripe";

export const runtime = "nodejs";

/** Diagnostic local (ne renvoie jamais la cle complete). */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const secret = env.STRIPE_SECRET_KEY ?? "";
  const prefix = secret.slice(0, 8) || "(vide)";

  return NextResponse.json({
    ok: isStripeConfigured(),
    checks: {
      STRIPE_PRICE_ID: Boolean(env.STRIPE_PRICE_ID),
      STRIPE_SECRET_KEY_length: secret.length,
      STRIPE_SECRET_KEY_prefix: prefix,
      STRIPE_SECRET_KEY_valid: isStripeSecretKeyValid(secret),
      STRIPE_WEBHOOK_SECRET: Boolean(env.STRIPE_WEBHOOK_SECRET),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
      NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL ?? null,
    },
    hint: !isStripeSecretKeyValid(secret)
      ? "Remplace STRIPE_SECRET_KEY par une cle sk_test_... (~100 caracteres) depuis https://dashboard.stripe.com/test/apikeys → Creer une cle secrete → Copier."
      : null,
  });
}
