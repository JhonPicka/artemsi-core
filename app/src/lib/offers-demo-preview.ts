import type { OfferCardData } from "@/components/offers/offer-card";

type OfferStatus = "sent" | "seen" | "applied" | "archived";

export type AssignmentEmbedRow = {
  status: OfferStatus;
  assigned_at: string;
  offer?: OfferCardData | null;
  offers?: OfferCardData | OfferCardData[] | null;
};

/** PostgREST peut renvoyer `offers` (nom de table) ou `offer` (alias) ; parfois un tableau. */
export function offerFromAssignmentEmbed(row: AssignmentEmbedRow): OfferCardData | null {
  if (row.offer) return row.offer;
  const nested = row.offers;
  if (Array.isArray(nested)) return nested[0] ?? null;
  if (nested && typeof nested === "object") return nested;
  return null;
}
