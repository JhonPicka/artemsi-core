import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getPostLoginPath, isAdminUser } from "@/lib/admin-auth";
import { isActiveSubscriptionStatus, syncUserBilling } from "@/lib/billing";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//")) return null;
  return next;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const nextPath = safeNextPath(requestUrl.searchParams.get("next"));

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("Lien invalide ou expire.")}`, requestUrl.origin),
      );
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("Lien invalide ou expire.")}`, requestUrl.origin),
      );
    }
  } else {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Lien de connexion incomplet.")}`, requestUrl.origin),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Session introuvable apres validation du lien.")}`, requestUrl.origin),
    );
  }

  if (isAdminUser(user)) {
    return NextResponse.redirect(new URL(getPostLoginPath(user), requestUrl.origin));
  }

  if (!user.email) {
    return NextResponse.redirect(new URL("/subscribe", requestUrl.origin));
  }

  const billingStatus = await syncUserBilling(user);
  if (!isActiveSubscriptionStatus(billingStatus)) {
    return NextResponse.redirect(
      new URL(
        `/subscribe?error=${encodeURIComponent("Aucun abonnement actif pour cet email.")}`,
        requestUrl.origin,
      ),
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed) {
    return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
  }

  return NextResponse.redirect(new URL(nextPath ?? "/dashboard", requestUrl.origin));
}
