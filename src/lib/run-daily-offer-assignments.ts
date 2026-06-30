import { insertNewOfferAssignments } from "@/lib/offer-assignment-batch";
import { isAdminUser } from "@/lib/admin-auth";
import { isActiveSubscriptionStatus } from "@/lib/billing";
import { isBillingBypassEmail } from "@/lib/billing-access";
import { parisStartOfTodayIso } from "@/lib/dates-fr";
import { loadMatchableProfiles } from "@/lib/load-matchable-profiles";
import {
  computeOfferMatchScore,
  profileMatchesOffer,
  type MatchableOffer,
} from "@/lib/offer-matching";
import { createAdminClient } from "@/lib/supabase/admin";
import { isBillingEnforced } from "@/lib/stripe";

/** Nouvelles offres « Pour moi » max / jour civil (Paris) pour les abonnés Pro. */
export const PRO_DAILY_ASSIGNMENT_CAP = 5;

const OFFERS_LOOKBACK_DAYS = 14;

export type DailyAssignmentResult = {
  profilesConsidered: number;
  proProfiles: number;
  offersScanned: number;
  assignmentsInserted: number;
  notificationsInserted: number;
  skippedAtDailyCap: number;
};

function isProProfile(profile: {
  id: string;
  email: string | null;
  subscription_status: string | null;
}): boolean {
  if (isAdminUser({ id: profile.id, email: profile.email })) return true;
  if (!isBillingEnforced()) return true;
  if (profile.email && isBillingBypassEmail(profile.email)) return true;
  return isActiveSubscriptionStatus(profile.subscription_status);
}

async function loadAssignmentsTodayCounts(
  supabase: ReturnType<typeof createAdminClient>,
  userIds: string[],
  sinceIso: string,
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (const id of userIds) counts.set(id, 0);
  if (userIds.length === 0) return counts;

  const { data, error } = await supabase
    .from("offer_assignments")
    .select("user_id")
    .in("user_id", userIds)
    .gte("assigned_at", sinceIso);

  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    const userId = row.user_id as string;
    counts.set(userId, (counts.get(userId) ?? 0) + 1);
  }

  return counts;
}

async function loadAllAssignmentOfferIdsByUser(
  supabase: ReturnType<typeof createAdminClient>,
  userIds: string[],
): Promise<Map<string, Set<string>>> {
  const map = new Map<string, Set<string>>();
  for (const id of userIds) map.set(id, new Set());
  if (userIds.length === 0) return map;

  const { data, error } = await supabase
    .from("offer_assignments")
    .select("user_id, offer_id")
    .in("user_id", userIds);

  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    const userId = row.user_id as string;
    const set = map.get(userId) ?? new Set<string>();
    set.add(row.offer_id as string);
    map.set(userId, set);
  }

  return map;
}

async function loadRecentOffers(
  supabase: ReturnType<typeof createAdminClient>,
): Promise<MatchableOffer[]> {
  const since = new Date();
  since.setDate(since.getDate() - OFFERS_LOOKBACK_DAYS);

  const { data, error } = await supabase
    .from("offers")
    .select("id,title,company,location,description,study_domain,is_partner_exclusive")
    .is("hidden_at", null)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(1200);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    company: row.company as string | null,
    location: row.location as string | null,
    summary: (row.description as string | null) ?? "",
    study_domain: row.study_domain as string | null,
    is_partner_exclusive: Boolean(row.is_partner_exclusive),
  }));
}

export async function runDailyOfferAssignments(): Promise<DailyAssignmentResult> {
  const supabase = createAdminClient();
  const sinceToday = parisStartOfTodayIso();

  const [profiles, offers, billingProfilesRes] = await Promise.all([
    loadMatchableProfiles(supabase),
    loadRecentOffers(supabase),
    supabase.from("profiles").select("id, email, subscription_status").eq("onboarding_completed", true),
  ]);

  if (billingProfilesRes.error) throw new Error(billingProfilesRes.error.message);

  const billingById = new Map(
    (billingProfilesRes.data ?? []).map((row) => [
      row.id as string,
      row as { id: string; email: string | null; subscription_status: string | null },
    ]),
  );

  const proProfiles = profiles.filter((profile) => {
    const billing = billingById.get(profile.id);
    return billing && isProProfile(billing);
  });

  const proIds = proProfiles.map((p) => p.id);
  const [todayCounts, existingByUser] = await Promise.all([
    loadAssignmentsTodayCounts(supabase, proIds, sinceToday),
    loadAllAssignmentOfferIdsByUser(supabase, proIds),
  ]);

  const offersById = new Map(offers.map((offer) => [offer.id, offer]));
  const pairs: { user_id: string; offer_id: string }[] = [];
  let skippedAtDailyCap = 0;

  for (const profile of proProfiles) {
    const assignedToday = todayCounts.get(profile.id) ?? 0;
    const slots = Math.max(0, PRO_DAILY_ASSIGNMENT_CAP - assignedToday);
    if (slots === 0) {
      skippedAtDailyCap += 1;
      continue;
    }

    const existing = existingByUser.get(profile.id) ?? new Set<string>();

    const ranked = offers
      .filter((offer) => !existing.has(offer.id) && profileMatchesOffer(profile, offer))
      .map((offer) => ({
        offer,
        score: computeOfferMatchScore(profile, offer),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, slots);

    for (const entry of ranked) {
      pairs.push({ user_id: profile.id, offer_id: entry.offer.id });
    }
  }

  const { insertedAssignments, insertedNotifications } = await insertNewOfferAssignments(
    supabase,
    pairs,
    offersById,
    profiles,
    false,
  );

  return {
    profilesConsidered: profiles.length,
    proProfiles: proProfiles.length,
    offersScanned: offers.length,
    assignmentsInserted: insertedAssignments,
    notificationsInserted: insertedNotifications,
    skippedAtDailyCap,
  };
}
