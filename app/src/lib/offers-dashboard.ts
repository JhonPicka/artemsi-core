import type { OfferCardData } from "@/components/offers/offer-card";

export const OFFERS_VIEWS = ["pour-moi", "exclusives", "jobboard"] as const;
export type OffersView = (typeof OFFERS_VIEWS)[number];

export const JOBBOARD_PAGE_SIZE = 24;

export function parseOffersView(raw?: string | null): OffersView {
  if (raw === "exclusives" || raw === "partenaires") return "exclusives";
  if (raw === "jobboard") return "jobboard";
  return "pour-moi";
}

export function parseJobboardPage(raw?: string | null): number {
  const parsed = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function buildOffersHref(params: {
  view?: OffersView;
  page?: number;
  q?: string;
}) {
  const search = new URLSearchParams();
  const view = params.view ?? "pour-moi";

  if (view !== "pour-moi") {
    search.set("view", view);
  }

  const q = params.q?.trim();
  if (q) {
    search.set("q", q);
  }

  if (view === "jobboard" && params.page && params.page > 1) {
    search.set("page", String(params.page));
  }

  const query = search.toString();
  return query ? `/dashboard/offres?${query}` : "/dashboard/offres";
}

export function filterJobboardOffers(
  offers: readonly OfferCardData[],
  options: { q?: string },
): OfferCardData[] {
  const needle = options.q?.trim().toLowerCase();

  return offers.filter((offer) => {
    if (!needle) {
      return true;
    }

    const haystack = [offer.title, offer.company, offer.location]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(needle);
  });
}

export function paginateOffers<T>(offers: readonly T[], page: number, pageSize: number) {
  const total = offers.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: offers.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total,
    pageSize,
  };
}
