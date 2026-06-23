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

type OfferRow = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  description: string | null;
  is_partner_exclusive: boolean;
};

function mapOfferRow(row: OfferRow): MatchableOffer {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    summary: row.description ?? "",
    is_partner_exclusive: Boolean(row.is_partner_exclusive),
  };
}

async function loadRecentOffersForMatching(
  supabase: ReturnType<typeof createAdminClient>,
): Promise<MatchableOffer[]> {
  const since = new Date();
  since.setDate(since.getDate() - MATCH_OFFERS_DAYS);

  const { data, error } = await supabase
    .from("offers")
    .select("id,title,company,location,description,is_partner_exclusive")
    .is("hidden_at", null)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(MATCH_OFFERS_LIMIT);

  if (error) throw new Error(`Read offers for matching failed: ${error.message}`);

  return (data ?? []).map((row) => mapOfferRow(row as OfferRow));
}

async function loadOffersByIds(
  supabase: ReturnType<typeof createAdminClient>,
  offerIds: readonly string[],
): Promise<MatchableOffer[]> {
  if (offerIds.length === 0) return [];

  const { data, error } = await supabase
    .from("offers")
    .select("id,title,company,location,description,is_partner_exclusive")
    .in("id", [...offerIds])
    .is("hidden_at", null);

  if (error) throw new Error(`Read offers for matching failed: ${error.message}`);

  return (data ?? []).map((row) => mapOfferRow(row as OfferRow));
}

async function executeOfferMatching(
  supabase: ReturnType<typeof createAdminClient>,
  offersForMatching: MatchableOffer[],
  dryRun: boolean,
): Promise<OfferMatchingResult> {
  const profiles = await loadMatchableProfiles(supabase);
  const offersById = new Map(offersForMatching.map((offer) => [offer.id, offer]));

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
    profiles,
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

/** Matche des offres nouvellement ajoutées avec les profils complets. */
export async function runOfferMatchingForOffers(
  offerIds: readonly string[],
  { dryRun = false }: { dryRun?: boolean } = {},
): Promise<OfferMatchingResult> {
  const supabase = createAdminClient();
  const offersForMatching = await loadOffersByIds(supabase, offerIds);
  return executeOfferMatching(supabase, offersForMatching, dryRun);
}

/**
 * Re-match manuel de tout le catalogue récent (secours ops via POST /api/offers/match).
 * Le flux normal déclenche le matching à l'ajout d'offres uniquement.
 */
export async function runOfferMatching({
  dryRun = false,
}: {
  dryRun?: boolean;
} = {}): Promise<OfferMatchingResult> {
  const supabase = createAdminClient();
  const offersForMatching = await loadRecentOffersForMatching(supabase);
  return executeOfferMatching(supabase, offersForMatching, dryRun);
}
