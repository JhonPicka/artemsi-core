import type { OfferCardData } from "@/components/offers/offer-card";

export function mergeExclusiveOffersWithAssignments(
  offers: readonly OfferCardData[],
  assignments: Array<{ status: string; offer: OfferCardData | null }>,
): Array<{ status: "sent" | "seen" | "applied" | "archived"; offer: OfferCardData }> {
  const statusByOfferId = new Map<string, "sent" | "seen" | "applied" | "archived">();
  for (const row of assignments) {
    if (row.offer?.is_partner_exclusive && isOfferStatus(row.status)) {
      statusByOfferId.set(row.offer.id, row.status);
    }
  }

  return offers.map((offer) => ({
    status: statusByOfferId.get(offer.id) ?? "sent",
    offer,
  }));
}

function isOfferStatus(value: string): value is "sent" | "seen" | "applied" | "archived" {
  return value === "sent" || value === "seen" || value === "applied" || value === "archived";
}
