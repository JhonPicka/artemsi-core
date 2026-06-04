import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { sendAccountSetupEmail } from "@/lib/account-setup";
import { syncBillingEmailToProfiles } from "@/lib/billing";
import { env } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function getWebhookSecret() {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET manquante");
  }
  return env.STRIPE_WEBHOOK_SECRET;
}

async function afterBillingUpsert(email: string) {
  await syncBillingEmailToProfiles(email);
}

function toIsoOrNull(unixSeconds?: number | null) {
  if (!unixSeconds) return null;
  return new Date(unixSeconds * 1000).toISOString();
}

function pickId(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in (value as Record<string, unknown>)) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" ? id : null;
  }
  return null;
}

export async function POST(request: Request) {
  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
    }
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, getWebhookSecret());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook invalide" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as unknown as Record<string, unknown>;
        const customerDetails = session.customer_details as { email?: string | null } | undefined;
        const rawEmail =
          (customerDetails?.email as string | undefined) ??
          (session.customer_email as string | null | undefined) ??
          null;
        const email = rawEmail ? rawEmail.toLowerCase() : null;
        if (!email) break;

        const { data: existing, error: existingError } = await admin
          .from("billing_customers")
          .select("subscription_status, last_event_id")
          .eq("email", email)
          .maybeSingle();
        if (existingError) throw new Error(existingError.message);

        const values = {
          email,
          subscription_status: "active",
          stripe_customer_id: pickId(session.customer),
          stripe_subscription_id: pickId(session.subscription),
          stripe_checkout_session_id: session.id as string,
          last_event_type: event.type,
          last_event_id: event.id,
          updated_at: new Date().toISOString(),
        };

        const { error } = await admin.from("billing_customers").upsert(values, { onConflict: "email" });
        if (error) throw new Error(error.message);
        await afterBillingUpsert(email);

        const alreadyProcessedThisEvent = existing?.last_event_id === event.id;
        const wasAlreadyActive = existing?.subscription_status === "active";
        if (!alreadyProcessedThisEvent && !wasAlreadyActive) {
          await sendAccountSetupEmail(email);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as unknown as Record<string, unknown>;
        const rawEmail = invoice.customer_email as string | null | undefined;
        const email = rawEmail ? rawEmail.toLowerCase() : null;
        if (!email) break;

        const lines = invoice.lines as { data?: Array<{ period?: { end?: number | null } | null }> } | undefined;
        const periodEnd = lines?.data?.[0]?.period?.end ?? null;

        const values = {
          email,
          subscription_status: "active",
          stripe_customer_id: pickId(invoice.customer),
          stripe_subscription_id: pickId(invoice.subscription),
          current_period_end: toIsoOrNull(periodEnd),
          last_event_type: event.type,
          last_event_id: event.id,
          updated_at: new Date().toISOString(),
        };

        const { error } = await admin.from("billing_customers").upsert(values, { onConflict: "email" });
        if (error) throw new Error(error.message);
        await afterBillingUpsert(email);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as unknown as Record<string, unknown>;
        const customerId = pickId(subscription.customer);
        if (!customerId) break;

        const { data: existing, error: findError } = await admin
          .from("billing_customers")
          .select("email")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (findError) throw new Error(findError.message);
        if (!existing?.email) break;

        const subscriptionStatus = subscription.status as string | undefined;
        const status =
          subscriptionStatus === "active" || subscriptionStatus === "trialing"
            ? "active"
            : subscriptionStatus === "past_due"
              ? "past_due"
              : "canceled";

        const periodEnd = (subscription.current_period_end as number | null | undefined) ?? null;

        const values = {
          email: existing.email,
          subscription_status: status,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id as string,
          current_period_end: toIsoOrNull(periodEnd),
          last_event_type: event.type,
          last_event_id: event.id,
          updated_at: new Date().toISOString(),
        };

        const { error } = await admin.from("billing_customers").upsert(values, { onConflict: "email" });
        if (error) throw new Error(error.message);
        await afterBillingUpsert(existing.email);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur traitement webhook" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
