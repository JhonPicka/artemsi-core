import type { OfferCardData } from "@/components/offers/offer-card";
import { prioritizeExternalLinkOffers } from "@/lib/offer-external-link";

export const OFFERS_VIEWS = ["pour-moi", "partenaires", "jobboard"] as const;
export type OffersView = (typeof OFFERS_VIEWS)[number];

export const JOBBOARD_PAGE_SIZE = 24;

export const JOBBOARD_SOURCE_FILTERS = [
  { value: "all", label: "Toutes les sources" },
  { value: "indeed", label: "Source externe" },
  { value: "partner", label: "Partenaire" },
  { value: "autre", label: "Autre" },
] as const;

export type JobboardSourceFilter = (typeof JOBBOARD_SOURCE_FILTERS)[number]["value"];

export function parseOffersView(raw?: string | null): OffersView {
  if (raw === "partenaires" || raw === "jobboard") return raw;
  return "pour-moi";
}

export function parseJobboardPage(raw?: string | null): number {
  const parsed = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function parseJobboardSource(raw?: string | null): JobboardSourceFilter {
  if (raw === "indeed" || raw === "partner" || raw === "autre") return raw;
  return "all";
}

export function buildOffersHref(params: {
  view?: OffersView;
  page?: number;
  q?: string;
  source?: JobboardSourceFilter;
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

  const source = params.source ?? "all";
  if (source !== "all") {
    search.set("source", source);
  }

  if (view === "jobboard" && params.page && params.page > 1) {
    search.set("page", String(params.page));
  }

  const query = search.toString();
  return query ? `/dashboard/offres?${query}` : "/dashboard/offres";
}

export function filterJobboardOffers(
  offers: readonly OfferCardData[],
  options: { q?: string; source?: JobboardSourceFilter },
): OfferCardData[] {
  const needle = options.q?.trim().toLowerCase();
  const source = options.source ?? "all";

  const filtered = offers.filter((offer) => {
    if (source !== "all" && offer.source !== source) {
      return false;
    }

    if (!needle) {
      return true;
    }

    const haystack = [offer.title, offer.company, offer.location]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(needle);
  });

  return prioritizeExternalLinkOffers(filtered);
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
