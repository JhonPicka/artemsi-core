import { NextResponse } from "next/server";

import { getAdminUserId } from "@/lib/admin-auth";
import { hasApiAccountAccess, userHasProAccess } from "@/lib/billing";
import { getAppUrl } from "@/lib/email";
import { assertFreeUserCanAccessPublicOffer } from "@/lib/freemium-access";
import {
  hideOfferAfterDeadLinkReports,
  OFFER_DEAD_LINK_HIDE_THRESHOLD,
} from "@/lib/offer-link-reports";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { offerLinkReportSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await hasApiAccountAccess(user))) {
    return NextResponse.json({ error: "Compte requis." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = offerLinkReportSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Payload invalide" },
      { status: 400 },
    );
  }

  const { offerId, notes } = parsed.data;

  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .select("id, title, is_public, hidden_at")
    .eq("id", offerId)
    .maybeSingle();

  if (offerError) {
    return NextResponse.json({ error: offerError.message }, { status: 500 });
  }

  if (!offer) {
    return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });
  }

  if (offer.hidden_at) {
    return NextResponse.json(
      { error: "Cette offre a deja ete retiree du catalogue." },
      { status: 410 },
    );
  }

  const isPro = await userHasProAccess(user);
  if (!isPro && offer.is_public) {
    try {
      await assertFreeUserCanAccessPublicOffer(supabase, offerId);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Offre non accessible." },
        { status: 403 },
      );
    }
  }

  const { error: insertError } = await supabase.from("offer_link_reports").insert({
    user_id: user.id,
    offer_id: offerId,
    notes: notes?.trim() || null,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ ok: true, alreadyReported: true });
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const adminUserId = getAdminUserId();
  const admin = adminUserId ? createAdminClient() : null;
  let offerHidden = false;

  if (admin) {
    offerHidden = await hideOfferAfterDeadLinkReports(admin, offerId);

    if (adminUserId) {
      const reportMessage = offerHidden
        ? `${offer.title} — ${OFFER_DEAD_LINK_HIDE_THRESHOLD} signalements : offre masquee automatiquement.`
        : `${offer.title} — signale par ${user.email ?? "utilisateur"}`;

      await admin.from("notifications").insert({
        user_id: adminUserId,
        type: "offer_dead_link",
        title: offerHidden ? "Offre masquee (lien mort)" : "Lien mort signale",
        message: reportMessage,
        link: `${getAppUrl()}/admin/offres/${offerId}`,
      });
    }
  }

  return NextResponse.json({ ok: true, alreadyReported: false, offerHidden });
}
