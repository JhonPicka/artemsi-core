import { insertNewOfferAssignments } from "@/lib/offer-assignment-batch";
import { loadMatchableProfiles } from "@/lib/load-matchable-profiles";
import { buildProfileOfferPairs, type MatchableOffer } from "@/lib/offer-matching";
import { createAdminClient } from "@/lib/supabase/admin";

const RECENT_OFFERS_DAYS = 60;
const RECENT_OFFERS_LIMIT = 800;

export type UserOfferMatchResult = {
  offersScanned: number;
  matchedPairs: number;
  insertedAssignments: number;
  insertedNotifications: number;
};

export async function assignMatchingOffersToUser(
  userId: string,
  options?: { dryRun?: boolean },
): Promise<UserOfferMatchResult> {
  const dryRun = options?.dryRun ?? false;
  const supabase = createAdminClient();

  const profiles = await loadMatchableProfiles(supabase);
  const profile = profiles.find((p) => p.id === userId);

  if (!profile) {
    return {
      offersScanned: 0,
      matchedPairs: 0,
      insertedAssignments: 0,
      insertedNotifications: 0,
    };
  }

  const since = new Date();
  since.setDate(since.getDate() - RECENT_OFFERS_DAYS);

  const { data: offers, error: offersError } = await supabase
    .from("offers")
    .select("id,title,company,location,description,study_domain,is_partner_exclusive")
    .is("hidden_at", null)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(RECENT_OFFERS_LIMIT);

  if (offersError) throw new Error(offersError.message);

  const matchableOffers: MatchableOffer[] = (offers ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    company: row.company as string | null,
    location: row.location as string | null,
    summary: (row.description as string | null) ?? "",
    study_domain: (row.study_domain as string | null) ?? null,
    is_partner_exclusive: Boolean(row.is_partner_exclusive),
  }));

  const offersById = new Map(matchableOffers.map((o) => [o.id, o]));

  const pairs = buildProfileOfferPairs([profile], matchableOffers);
  const { insertedAssignments, insertedNotifications } = await insertNewOfferAssignments(
    supabase,
    pairs,
    offersById,
    [profile],
    dryRun,
  );

  return {
    offersScanned: matchableOffers.length,
    matchedPairs: pairs.length,
    insertedAssignments,
    insertedNotifications,
  };
}
