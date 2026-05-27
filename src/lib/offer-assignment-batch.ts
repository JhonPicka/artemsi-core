import type { SupabaseClient } from "@supabase/supabase-js";

import type { MatchableOffer } from "@/lib/offer-matching";

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export async function insertNewOfferAssignments(
  supabase: SupabaseClient,
  pairs: { user_id: string; offer_id: string }[],
  offersById: Map<string, MatchableOffer>,
  dryRun: boolean,
): Promise<{ insertedAssignments: number; insertedNotifications: number }> {
  if (pairs.length === 0 || dryRun) {
    return { insertedAssignments: 0, insertedNotifications: 0 };
  }

  const existingPairs = new Set<string>();
  const offerIds = Array.from(new Set(pairs.map((p) => p.offer_id)));

  for (const batch of chunk(offerIds, 200)) {
    const { data, error } = await supabase
      .from("offer_assignments")
      .select("user_id,offer_id")
      .in("offer_id", batch);
    if (error) throw new Error(`Read assignments failed: ${error.message}`);
    for (const row of data ?? []) {
      existingPairs.add(`${row.user_id}:${row.offer_id}`);
    }
  }

  const newAssignments = pairs.filter((p) => !existingPairs.has(`${p.user_id}:${p.offer_id}`));
  if (newAssignments.length === 0) {
    return { insertedAssignments: 0, insertedNotifications: 0 };
  }

  const { error: assignError } = await supabase.from("offer_assignments").insert(
    newAssignments.map((p) => ({
      user_id: p.user_id,
      offer_id: p.offer_id,
      status: "sent",
    })),
  );
  if (assignError) throw new Error(`Insert assignments failed: ${assignError.message}`);

  const notifications = newAssignments.map((a) => {
    const offer = offersById.get(a.offer_id);
    return {
      user_id: a.user_id,
      type: "offer_assigned",
      title: "Nouvelle offre pour toi",
      message: offer
        ? `${offer.title}${offer.company ? ` - ${offer.company}` : ""}`
        : "Une nouvelle offre correspond à ton profil.",
      link: "/dashboard/offres",
    };
  });

  const { error: notifError } = await supabase.from("notifications").insert(notifications);
  if (notifError) throw new Error(`Insert notifications failed: ${notifError.message}`);

  return {
    insertedAssignments: newAssignments.length,
    insertedNotifications: notifications.length,
  };
}
