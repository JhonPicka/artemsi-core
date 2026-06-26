import type { SupabaseClient } from "@supabase/supabase-js";

import { isAdminUser } from "@/lib/admin-auth";
import { isActiveSubscriptionStatus } from "@/lib/billing";
import { isBillingBypassEmail } from "@/lib/billing-access";
import {
  computeOfferMatchScore,
  type MatchableOffer,
  type MatchableProfile,
} from "@/lib/offer-matching";
import { isBillingEnforced } from "@/lib/stripe";

/** Part du jobboard public visible en compte gratuit (moitié la moins récente). */
export const FREE_JOBBOARD_FRACTION = 0.5;

/** Nombre max d'offres personnalisées (« Pour moi », hors partenaires) en compte gratuit. */
export const FREE_TIER_ASSIGNMENT_CAP = 2;

export type AssignmentPair = { user_id: string; offer_id: string };

/**
 * Offres triées par `created_at` décroissant : le gratuit ne voit pas les plus récentes,
 * seulement la moitié la plus ancienne du catalogue.
 */
export function sliceJobboardForFreeTier<T>(offers: readonly T[]): T[] {
  if (offers.length === 0) return [];
  const hiddenRecentCount = Math.ceil(offers.length * FREE_JOBBOARD_FRACTION);
  return offers.slice(hiddenRecentCount);
}

export async function getFreeTierPublicOfferIds(
  supabase: SupabaseClient,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("offers")
    .select("id")
    .eq("is_public", true)
    .is("hidden_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return new Set(sliceJobboardForFreeTier(data ?? []).map((row) => row.id as string));
}

export async function assertFreeUserCanAccessPublicOffer(
  supabase: SupabaseClient,
  offerId: string,
): Promise<void> {
  const allowed = await getFreeTierPublicOfferIds(supabase);
  if (!allowed.has(offerId)) {
    throw new Error("Cette offre est réservée aux abonnés Pro.");
  }
}

export const PARTNER_APPLY_BLOCKED_MESSAGE =
  "Les candidatures sur les offres exclusives sont réservées aux abonnés Pro.";

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

export async function countPersonalAssignmentsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("offer_assignments")
    .select("id, offers!inner(is_partner_exclusive)")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).filter((row) => {
    const offer = row.offers as { is_partner_exclusive?: boolean } | null;
    return !offer?.is_partner_exclusive;
  }).length;
}

export async function canCreatePersonalAssignmentForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, subscription_status")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!profile) return false;
  if (isProProfile(profile as { id: string; email: string | null; subscription_status: string | null })) {
    return true;
  }

  const count = await countPersonalAssignmentsForUser(supabase, userId);
  return count < FREE_TIER_ASSIGNMENT_CAP;
}

async function loadPersonalAssignmentCounts(
  supabase: SupabaseClient,
  userIds: readonly string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (const id of userIds) counts.set(id, 0);
  if (userIds.length === 0) return counts;

  const { data, error } = await supabase
    .from("offer_assignments")
    .select("user_id, offers!inner(is_partner_exclusive)")
    .in("user_id", [...userIds]);

  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    const userId = row.user_id as string;
    const offer = row.offers as { is_partner_exclusive?: boolean } | null;
    if (offer?.is_partner_exclusive) continue;
    counts.set(userId, (counts.get(userId) ?? 0) + 1);
  }

  return counts;
}

async function loadProUserIds(
  supabase: SupabaseClient,
  userIds: readonly string[],
): Promise<Set<string>> {
  const pro = new Set<string>();
  if (userIds.length === 0) return pro;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, subscription_status")
    .in("id", [...userIds]);

  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    if (
      isProProfile(row as { id: string; email: string | null; subscription_status: string | null })
    ) {
      pro.add(row.id as string);
    }
  }

  return pro;
}

function isPartnerOffer(
  offerId: string,
  offersById: Map<string, MatchableOffer>,
): boolean {
  return Boolean(offersById.get(offerId)?.is_partner_exclusive);
}

/** Limite les nouvelles assignations « Pour moi » pour les comptes gratuits. */
export async function filterAssignmentPairsForFreeTier(
  supabase: SupabaseClient,
  pairs: readonly AssignmentPair[],
  profilesById: Map<string, MatchableProfile>,
  offersById: Map<string, MatchableOffer>,
): Promise<AssignmentPair[]> {
  if (pairs.length === 0) return [];

  const userIds = Array.from(new Set(pairs.map((pair) => pair.user_id)));
  const [proUserIds, existingCounts] = await Promise.all([
    loadProUserIds(supabase, userIds),
    loadPersonalAssignmentCounts(supabase, userIds),
  ]);

  const allowed: AssignmentPair[] = [];
  const pendingPersonalByUser = new Map<string, AssignmentPair[]>();

  for (const pair of pairs) {
    if (proUserIds.has(pair.user_id) || isPartnerOffer(pair.offer_id, offersById)) {
      allowed.push(pair);
      continue;
    }

    const list = pendingPersonalByUser.get(pair.user_id) ?? [];
    list.push(pair);
    pendingPersonalByUser.set(pair.user_id, list);
  }

  for (const [userId, personalPairs] of pendingPersonalByUser) {
    const slots = Math.max(0, FREE_TIER_ASSIGNMENT_CAP - (existingCounts.get(userId) ?? 0));
    if (slots === 0) continue;

    const profile = profilesById.get(userId);
    if (!profile) continue;

    const ranked = personalPairs
      .map((pair) => {
        const offer = offersById.get(pair.offer_id);
        const score = offer ? computeOfferMatchScore(profile, offer) : 0;
        return { pair, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, slots)
      .map((entry) => entry.pair);

    allowed.push(...ranked);
  }

  return allowed;
}

export function sliceVisiblePersonalAssignments<T>(
  assignments: readonly T[],
  isPro: boolean,
): T[] {
  if (isPro) return [...assignments];
  return assignments.slice(0, FREE_TIER_ASSIGNMENT_CAP);
}

export function hasHiddenPersonalAssignments(total: number, isPro: boolean): boolean {
  return !isPro && total > FREE_TIER_ASSIGNMENT_CAP;
}
