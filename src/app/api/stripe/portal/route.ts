import { NextResponse } from "next/server";

import { syncUserBilling } from "@/lib/billing";
import { getAppBaseUrl, getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe non configure" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  await syncUserBilling(user);

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const customerId = profile?.stripe_customer_id;
  if (!customerId) {
    return NextResponse.json(
      { error: "Aucun abonnement Stripe lie a ce compte. Utilise le meme email qu au paiement." },
      { status: 400 },
    );
  }

  const stripe = getStripeClient();
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${getAppBaseUrl()}/dashboard`,
  });

  return NextResponse.json({ url: portalSession.url });
}
