import type { SupabaseClient } from "@supabase/supabase-js";

import { assignOfferToUser } from "@/lib/assign-offer-to-user";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  extractKeywordsFromOffer,
  mergeInterestKeywords,
  removeInterestKeywords,
} from "@/lib/offer-interest-keywords";

export type RecordOfferInterestResult = {
  interested: boolean;
  keywords: string[];
  assignmentCreated: boolean;
};

export async function recordOfferInterest(
  supabase: SupabaseClient,
  userId: string,
  offerId: string,
): Promise<RecordOfferInterestResult> {
  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .select("id, title, company, description, is_public, hidden_at")
    .eq("id", offerId)
    .maybeSingle();

  if (offerError) throw new Error(offerError.message);
  if (!offer?.is_public || offer.hidden_at) {
    throw new Error("Seules les offres publiques peuvent etre marquees en interet.");
  }

  const keywords = extractKeywordsFromOffer({
    title: offer.title as string,
    company: offer.company as string | null,
    description: offer.description as string | null,
  });

  const { error: interestError } = await supabase.from("offer_interests").insert({
    user_id: userId,
    offer_id: offerId,
  });

  if (interestError && interestError.code !== "23505") {
    throw new Error(interestError.message);
  }

  const { data: pref } = await supabase
    .from("user_preferences")
    .select("interest_keywords")
    .eq("user_id", userId)
    .maybeSingle();

  const merged = mergeInterestKeywords(
    (pref?.interest_keywords as string[] | null) ?? [],
    keywords,
  );

  const { data: updatedPref, error: prefError } = await supabase
    .from("user_preferences")
    .update({
      interest_keywords: merged,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select("user_id")
    .maybeSingle();

  if (prefError) throw new Error(prefError.message);

  if (!updatedPref) {
    const { error: insertPrefError } = await supabase.from("user_preferences").insert({
      user_id: userId,
      interest_keywords: merged,
    });
    if (insertPrefError) throw new Error(insertPrefError.message);
  }

  let assignmentCreated = false;
  try {
    const admin = createAdminClient();
    const assignResult = await assignOfferToUser(admin, { userId, offerId });
    assignmentCreated = assignResult.created;
  } catch {
    // Service role absent en dev ou offre deja assignee
  }

  return { interested: true, keywords: merged, assignmentCreated };
}

export async function removeOfferInterest(
  supabase: SupabaseClient,
  userId: string,
  offerId: string,
): Promise<{ interested: false; keywords: string[] }> {
  const { data: offer } = await supabase
    .from("offers")
    .select("title, company, description")
    .eq("id", offerId)
    .maybeSingle();

  await supabase
    .from("offer_interests")
    .delete()
    .eq("user_id", userId)
    .eq("offer_id", offerId);

  const removedKeywords = offer
    ? extractKeywordsFromOffer({
        title: offer.title as string,
        company: offer.company as string | null,
        description: offer.description as string | null,
      })
    : [];

  const { data: pref } = await supabase
    .from("user_preferences")
    .select("interest_keywords")
    .eq("user_id", userId)
    .maybeSingle();

  const next = removeInterestKeywords(
    (pref?.interest_keywords as string[] | null) ?? [],
    removedKeywords,
  );

  await supabase
    .from("user_preferences")
    .update({ interest_keywords: next, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  return { interested: false, keywords: next };
}
