import type { SupabaseClient } from "@supabase/supabase-js";

/** Nombre de signalements distincts avant masquage automatique. */
export const OFFER_DEAD_LINK_HIDE_THRESHOLD = 3;

export type OfferHiddenReason = "dead_link";

export async function countOfferLinkReports(
  supabase: SupabaseClient,
  offerId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("offer_link_reports")
    .select("id", { count: "exact", head: true })
    .eq("offer_id", offerId);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function getOfferLinkReportCounts(
  supabase: SupabaseClient,
  offerIds: readonly string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (offerIds.length === 0) return counts;

  const { data, error } = await supabase
    .from("offer_link_reports")
    .select("offer_id")
    .in("offer_id", [...offerIds]);

  if (error) {
    throw new Error(error.message);
  }

  for (const row of data ?? []) {
    const id = row.offer_id as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return counts;
}

export async function hideOfferAfterDeadLinkReports(
  supabase: SupabaseClient,
  offerId: string,
): Promise<boolean> {
  const reportCount = await countOfferLinkReports(supabase, offerId);
  if (reportCount < OFFER_DEAD_LINK_HIDE_THRESHOLD) {
    return false;
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("offers")
    .update({
      hidden_at: now,
      hidden_reason: "dead_link" satisfies OfferHiddenReason,
      is_public: false,
      updated_at: now,
    })
    .eq("id", offerId)
    .is("hidden_at", null);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function clearOfferDeadLinkReports(
  supabase: SupabaseClient,
  offerId: string,
): Promise<void> {
  const { error } = await supabase.from("offer_link_reports").delete().eq("offer_id", offerId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function restoreOfferVisibility(
  supabase: SupabaseClient,
  offerId: string,
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("offers")
    .update({
      hidden_at: null,
      hidden_reason: null,
      updated_at: now,
    })
    .eq("id", offerId);

  if (error) {
    throw new Error(error.message);
  }
}
