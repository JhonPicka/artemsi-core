import type { SupabaseClient } from "@supabase/supabase-js";

import { canCreatePersonalAssignmentForUser } from "@/lib/freemium-access";

type AssignResult = {
  created: boolean;
  assignmentId: string | null;
  notificationCreated: boolean;
};

export async function assignOfferToUser(
  supabase: SupabaseClient,
  input: { userId: string; offerId: string },
): Promise<AssignResult> {
  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .select("id, title, company, is_partner_exclusive")
    .eq("id", input.offerId)
    .maybeSingle();

  if (offerError) throw new Error(offerError.message);
  if (!offer) throw new Error("Offre introuvable");

  const isPartnerExclusive = Boolean(offer.is_partner_exclusive);
  if (
    !isPartnerExclusive &&
    !(await canCreatePersonalAssignmentForUser(supabase, input.userId))
  ) {
    return { created: false, assignmentId: null, notificationCreated: false };
  }

  const { data: existing } = await supabase
    .from("offer_assignments")
    .select("id")
    .eq("user_id", input.userId)
    .eq("offer_id", input.offerId)
    .maybeSingle();

  if (existing?.id) {
    return { created: false, assignmentId: existing.id, notificationCreated: false };
  }

  const { data: inserted, error: assignError } = await supabase
    .from("offer_assignments")
    .insert({
      user_id: input.userId,
      offer_id: input.offerId,
      status: "sent",
    })
    .select("id")
    .single();

  if (assignError) throw new Error(assignError.message);

  const title = offer.title as string;
  const company = offer.company as string | null;
  const message = company ? `${title} - ${company}` : title;

  const { error: notifError } = await supabase.from("notifications").insert({
    user_id: input.userId,
    type: "offer_assigned",
    title: "Nouvelle offre pour toi",
    message,
    link: "/dashboard/offres",
  });

  if (notifError) throw new Error(notifError.message);

  return {
    created: true,
    assignmentId: inserted.id as string,
    notificationCreated: true,
  };
}
