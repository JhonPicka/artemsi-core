import { NextResponse } from "next/server";
import Stripe from "stripe";

import { BILLING_TRIAL_DAYS } from "@/lib/billing-offer";
import { env } from "@/lib/env";
import {
  getStripeClient,
  isStripeConfigured,
  isStripeSecretKeyValid,
  resolveAppBaseUrl,
} from "@/lib/stripe";
import { getRequestKey, takeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

type CheckoutBody = {
  email?: string;
};

export async function POST(request: Request) {
  const rate = await takeRateLimit({
    bucket: "stripe-checkout",
    key: getRequestKey(request),
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessaie dans quelques minutes." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } },
    );
  }

  if (!env.STRIPE_PRICE_ID) {
    return NextResponse.json(
      { error: "STRIPE_PRICE_ID manquant dans .env.local (enregistre le fichier)." },
      { status: 503 },
    );
  }

  if (!isStripeSecretKeyValid(env.STRIPE_SECRET_KEY)) {
    return NextResponse.json(
      {
        error:
          "STRIPE_SECRET_KEY invalide : utilise sk_test_ ou sk_live_ depuis https://dashboard.stripe.com/apikeys",
      },
      { status: 503 },
    );
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe non configure." }, { status: 503 });
  }

  let body: CheckoutBody = {};
  try {
    const text = await request.text();
    if (text) {
      body = JSON.parse(text) as CheckoutBody;
    }
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const email =
    typeof body.email === "string" && body.email.includes("@")
      ? body.email.trim().toLowerCase()
      : undefined;

  const baseUrl = resolveAppBaseUrl(request);
  const stripe = getStripeClient();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      locale: "fr",
      payment_method_types: ["card"],
      line_items: [{ price: env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      ...(email ? { customer_email: email } : {}),
      subscription_data: {
        trial_period_days: BILLING_TRIAL_DAYS,
        metadata: {
          product: "artemsi_alternance_monthly",
          ...(email ? { checkout_email: email } : {}),
        },
      },
      metadata: {
        product: "artemsi_alternance_monthly",
        ...(email ? { checkout_email: email } : {}),
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Session Stripe sans URL" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Stripe.errors.StripeError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Erreur Stripe";
    console.error("[stripe/checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
