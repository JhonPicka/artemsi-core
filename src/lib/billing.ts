import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type Stripe from "stripe";

import { isBillingBypassEmail } from "@/lib/billing-access";
import { isBillingEnforced } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export type SubscriptionStatus = "inactive" | "active" | "past_due" | "canceled";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isActiveSubscriptionStatus(status: SubscriptionStatus | string | null | undefined) {
  return status === "active";
}

function pickStripeId(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export function emailFromCheckoutSession(session: Stripe.Checkout.Session) {
  const metaEmail = session.metadata?.checkout_email;
  const raw =
    session.customer_details?.email ??
    session.customer_email ??
    (typeof metaEmail === "string" ? metaEmail : null);
  return raw ? normalizeEmail(raw) : null;
}

/** Active l'abonnement puis envoie l'email d'activation si besoin (page succès ou webhook). */
export async function finalizePaidCheckoutSession(
  session: Stripe.Checkout.Session,
  options: { lastEventId: string; forceSetupEmail?: boolean },
) {
  const email = emailFromCheckoutSession(session);
  if (!email) {
    return { email: null as string | null, activated: false, setupEmailSent: false };
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("billing_customers")
    .select("subscription_status, last_event_id")
    .eq("email", email)
    .maybeSingle();

  const alreadyProcessed = existing?.last_event_id === options.lastEventId;
  const wasAlreadyActive = existing?.subscription_status === "active";

  await activateBillingFromCheckoutSession(session, options.lastEventId);

  const shouldSendSetupEmail =
    options.forceSetupEmail || (!alreadyProcessed && !wasAlreadyActive);

  if (!shouldSendSetupEmail) {
    return { email, activated: true, setupEmailSent: false };
  }

  const { sendAccountSetupEmail } = await import("@/lib/account-setup");
  try {
    await sendAccountSetupEmail(email);
    return { email, activated: true, setupEmailSent: true };
  } catch (error) {
    console.error("[billing] setup email failed", error);
    return { email, activated: true, setupEmailSent: false };
  }
}

/** Active l'abonnement en base (webhook ou page succes checkout). */
export async function activateBillingFromCheckoutSession(
  session: Stripe.Checkout.Session,
  lastEventId?: string,
) {
  const email = emailFromCheckoutSession(session);
  if (!email) return false;

  const admin = createAdminClient();
  const values = {
    email,
    subscription_status: "active" as const,
    stripe_customer_id: pickStripeId(session.customer),
    stripe_subscription_id: pickStripeId(session.subscription),
    stripe_checkout_session_id: session.id,
    last_event_type: "checkout.session.completed",
    last_event_id: lastEventId ?? session.id,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin.from("billing_customers").upsert(values, { onConflict: "email" });
  if (error) {
    throw new Error(error.message);
  }

  await syncBillingEmailToProfiles(email);
  return true;
}

export async function userHasBillingAccess(email: string): Promise<boolean> {
  if (!isBillingEnforced()) return true;
  if (isBillingBypassEmail(email)) return true;
  const status = await getBillingStatusByEmail(email);
  return isActiveSubscriptionStatus(status);
}

export async function getBillingStatusByEmail(email: string): Promise<SubscriptionStatus> {
  if (isBillingBypassEmail(email)) {
    return "active";
  }

  const admin = createAdminClient();
  const normalizedEmail = normalizeEmail(email);

  const { data, error } = await admin
    .from("billing_customers")
    .select("subscription_status")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data?.subscription_status as SubscriptionStatus | undefined) ?? "inactive";
}

export async function syncProfileSubscriptionStatus(params: {
  userId: string;
  email: string;
}) {
  const { userId, email } = params;
  const normalizedEmail = normalizeEmail(email);
  const admin = createAdminClient();

  if (isBillingBypassEmail(normalizedEmail)) {
    const values = {
      id: userId,
      email: normalizedEmail,
      subscription_status: "active" as const,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      subscription_current_period_end: null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await admin.from("profiles").upsert(values, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return "active";
  }

  const { data: billing, error: billingError } = await admin
    .from("billing_customers")
    .select("subscription_status, stripe_customer_id, stripe_subscription_id, current_period_end")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (billingError) {
    throw new Error(billingError.message);
  }

  const subscriptionStatus =
    (billing?.subscription_status as SubscriptionStatus | undefined) ?? "inactive";
  const values = {
    id: userId,
    email: normalizedEmail,
    subscription_status: subscriptionStatus,
    stripe_customer_id: billing?.stripe_customer_id ?? null,
    stripe_subscription_id: billing?.stripe_subscription_id ?? null,
    subscription_current_period_end: billing?.current_period_end ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin.from("profiles").upsert(values, { onConflict: "id" });
  if (error) {
    throw new Error(error.message);
  }

  return subscriptionStatus;
}

/** After webhook upsert on billing_customers, sync every profile with that email. */
export async function syncBillingEmailToProfiles(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const admin = createAdminClient();

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id")
    .eq("email", normalizedEmail);

  if (error) {
    throw new Error(error.message);
  }

  for (const profile of profiles ?? []) {
    await syncProfileSubscriptionStatus({ userId: profile.id, email: normalizedEmail });
  }
}

export async function syncUserBilling(user: Pick<User, "id" | "email">) {
  if (!user.email) {
    return "inactive" as SubscriptionStatus;
  }
  return syncProfileSubscriptionStatus({
    userId: user.id,
    email: user.email,
  });
}

export async function requireActiveSubscription(user: Pick<User, "id" | "email">) {
  if (!user.email) {
    redirect("/subscribe");
  }

  if (!isBillingEnforced()) {
    return;
  }

  if (isBillingBypassEmail(user.email)) {
    await syncUserBilling(user);
    return;
  }

  const status = await syncUserBilling(user);
  if (!isActiveSubscriptionStatus(status)) {
    redirect("/subscribe");
  }
}

/** Guard API routes: true when paid access is allowed. */
export async function hasApiBillingAccess(user: Pick<User, "id" | "email">) {
  if (!user.email) return false;
  if (!isBillingEnforced()) return true;
  if (isBillingBypassEmail(user.email)) {
    await syncUserBilling(user);
    return true;
  }
  const status = await syncUserBilling(user);
  return isActiveSubscriptionStatus(status);
}
