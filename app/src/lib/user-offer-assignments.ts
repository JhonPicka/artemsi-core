import type { OfferCardData } from "@/components/offers/offer-card";
import { offerFromAssignmentEmbed, type AssignmentEmbedRow } from "@/lib/offers-demo-preview";
import type { SupabaseClient } from "@supabase/supabase-js";

export type OfferAssignmentStatus = "sent" | "seen" | "applied" | "archived";

export type UserOfferAssignment = {
  id: string;
  status: OfferAssignmentStatus;
  assigned_at: string;
  offer: OfferCardData;
};

type AssignmentIdRow = AssignmentEmbedRow & { id: string };

export async function fetchUserOfferAssignments(
  supabase: SupabaseClient,
  userId: string,
  limit = 50,
): Promise<{ assignments: UserOfferAssignment[]; error: string | null }> {
  const { data, error } = await supabase
    .from("offer_assignments")
    .select(
      "id, status, assigned_at, offers (id, title, company, location, description, url, source, is_partner_exclusive, application_guide)",
    )
    .eq("user_id", userId)
    .order("assigned_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { assignments: [], error: error.message };
  }

  const assignments: UserOfferAssignment[] = [];
  for (const row of (data ?? []) as AssignmentIdRow[]) {
    const offer = offerFromAssignmentEmbed(row);
    if (!offer) continue;
    assignments.push({
      id: row.id,
      status: row.status,
      assigned_at: row.assigned_at,
      offer,
    });
  }

  return { assignments, error: null };
}

export function countAssignmentsByStatus(assignments: Pick<UserOfferAssignment, "status">[]) {
  return assignments.reduce(
    (acc, row) => {
      acc[row.status] += 1;
      return acc;
    },
    { sent: 0, seen: 0, applied: 0, archived: 0 } as Record<OfferAssignmentStatus, number>,
  );
}
