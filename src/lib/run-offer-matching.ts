import { insertNewOfferAssignments } from "@/lib/offer-assignment-batch";
import { loadMatchableProfiles } from "@/lib/load-matchable-profiles";
import { buildProfileOfferPairs, type MatchableOffer } from "@/lib/offer-matching";
import { createAdminClient } from "@/lib/supabase/admin";

const MATCH_OFFERS_DAYS = 60;
const MATCH_OFFERS_LIMIT = 800;

export type OfferMatchingResult = {
  offersMatchedAgainst: number;
  matchedPairs: number;
  insertedAssignments: number;
  insertedNotifications: number;
  profilesConsidered: number;
  dryRun: boolean;
};

async function loadRecentOffersForMatching(
  supabase: ReturnType<typeof createAdminClient>,
): Promise<MatchableOffer[]> {
  const since = new Date();
  since.setDate(since.getDate() - MATCH_OFFERS_DAYS);

  const { data, error } = await supabase
    .from("offers")
    .select("id,title,company,location,description")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(MATCH_OFFERS_LIMIT);

  if (error) throw new Error(`Read offers for matching failed: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    company: row.company as string | null,
    location: row.location as string | null,
    summary: (row.description as string | null) ?? "",
  }));
}

/**
 * Matche les offres en base (60 derniers jours) avec les profils completes,
 * puis cree offer_assignments + notifications.
 */
export async function runOfferMatching({
  dryRun = false,
}: {
  dryRun?: boolean;
} = {}): Promise<OfferMatchingResult> {
  const supabase = createAdminClient();
  const profiles = await loadMatchableProfiles(supabase);
  const offersForMatching = await loadRecentOffersForMatching(supabase);
  const offersById = new Map(offersForMatching.map((o) => [o.id, o]));

  if (offersForMatching.length === 0 || profiles.length === 0) {
    return {
      offersMatchedAgainst: offersForMatching.length,
      matchedPairs: 0,
      insertedAssignments: 0,
      insertedNotifications: 0,
      profilesConsidered: profiles.length,
      dryRun,
    };
  }

  const pairs = buildProfileOfferPairs(profiles, offersForMatching);
  const { insertedAssignments, insertedNotifications } = await insertNewOfferAssignments(
    supabase,
    pairs,
    offersById,
    dryRun,
  );

  return {
    offersMatchedAgainst: offersForMatching.length,
    matchedPairs: pairs.length,
    insertedAssignments,
    insertedNotifications,
    profilesConsidered: profiles.length,
    dryRun,
  };
}
