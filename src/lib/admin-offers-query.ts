import type {
  OfferSourceFilter,
  OfferUrlPlatform,
  OfferUrlPlatformFilter,
  OfferVisibilityFilter,
} from "@/lib/admin-offer-url-platform";

export const ADMIN_OFFERS_PAGE_SIZE = 40;

export type AdminOffersSort =
  | "updated_desc"
  | "updated_asc"
  | "created_desc"
  | "created_asc"
  | "title_asc"
  | "title_desc"
  | "company_asc"
  | "company_desc"
  | "hidden_first";

export const ADMIN_OFFERS_SORT_OPTIONS: { value: AdminOffersSort; label: string }[] = [
  { value: "updated_desc", label: "Modifiée (récent → ancien)" },
  { value: "updated_asc", label: "Modifiée (ancien → récent)" },
  { value: "created_desc", label: "Ajoutée (récent → ancien)" },
  { value: "created_asc", label: "Ajoutée (ancien → récent)" },
  { value: "title_asc", label: "Titre (A → Z)" },
  { value: "title_desc", label: "Titre (Z → A)" },
  { value: "company_asc", label: "Entreprise (A → Z)" },
  { value: "company_desc", label: "Entreprise (Z → A)" },
  { value: "hidden_first", label: "Masquées en premier" },
];

export type AdminOffersListQuery = {
  page: number;
  sort: AdminOffersSort;
  search: string;
  platform: OfferUrlPlatformFilter;
  visibility: OfferVisibilityFilter;
  source: OfferSourceFilter;
};

export type AdminOffersListMeta = {
  totalFiltered: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const PLATFORM_URL_MARKERS: Record<Exclude<OfferUrlPlatform, "other">, string> = {
  hellowork: "hellowork",
  indeed: "indeed",
  linkedin: "linkedin",
  wttj: "welcometothejungle",
  apec: "apec",
  "france-travail": "francetravail",
};

const KNOWN_PLATFORM_MARKERS = [
  "hellowork",
  "indeed",
  "linkedin",
  "welcometothejungle",
  "apec",
  "francetravail",
  "pole-emploi",
];

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseSort(value: string | undefined): AdminOffersSort {
  const allowed = new Set(ADMIN_OFFERS_SORT_OPTIONS.map((option) => option.value));
  if (value && allowed.has(value as AdminOffersSort)) {
    return value as AdminOffersSort;
  }
  return "updated_desc";
}

function parsePlatform(value: string | undefined): OfferUrlPlatformFilter {
  const allowed = new Set([
    "all",
    "hellowork",
    "indeed",
    "linkedin",
    "wttj",
    "apec",
    "france-travail",
    "other",
  ]);
  if (value && allowed.has(value)) {
    return value as OfferUrlPlatformFilter;
  }
  return "all";
}

function parseVisibility(value: string | undefined): OfferVisibilityFilter {
  if (value === "public" || value === "private" || value === "hidden") return value;
  return "all";
}

function parseSource(value: string | undefined): OfferSourceFilter {
  if (value === "partner" || value === "autre" || value === "indeed") return value;
  return "all";
}

export function parseAdminOffersListQuery(
  params: Record<string, string | undefined>,
): AdminOffersListQuery {
  return {
    page: parsePositiveInt(params.page, 1),
    sort: parseSort(params.sort),
    search: (params.q ?? "").trim(),
    platform: parsePlatform(params.platform),
    visibility: parseVisibility(params.visibility),
    source: parseSource(params.source),
  };
}

export function buildAdminOffersHref(
  query: AdminOffersListQuery,
  overrides: Partial<AdminOffersListQuery> = {},
): string {
  const merged: AdminOffersListQuery = { ...query, ...overrides };
  const params = new URLSearchParams();

  if (merged.page > 1) params.set("page", String(merged.page));
  if (merged.sort !== "updated_desc") params.set("sort", merged.sort);
  if (merged.search) params.set("q", merged.search);
  if (merged.platform !== "all") params.set("platform", merged.platform);
  if (merged.visibility !== "all") params.set("visibility", merged.visibility);
  if (merged.source !== "all") params.set("source", merged.source);

  const qs = params.toString();
  return qs ? `/admin/offres?${qs}` : "/admin/offres";
}

function escapeIlike(term: string): string {
  return term.replace(/[%_\\]/g, "\\$&");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OffersFilterQuery = any;

export function applyAdminOffersFilters(
  query: OffersFilterQuery,
  filters: Pick<AdminOffersListQuery, "search" | "platform" | "visibility" | "source">,
): OffersFilterQuery {
  let next = query;

  if (filters.visibility === "public") {
    next = next.eq("is_public", true).is("hidden_at", null);
  } else if (filters.visibility === "private") {
    next = next.eq("is_public", false).is("hidden_at", null);
  } else if (filters.visibility === "hidden") {
    next = next.not("hidden_at", "is", null);
  }

  if (filters.source !== "all") {
    next = next.eq("source", filters.source);
  }

  if (filters.platform !== "all") {
    if (filters.platform === "other") {
      for (const marker of KNOWN_PLATFORM_MARKERS) {
        next = next.not("url", "ilike", `%${marker}%`);
      }
    } else if (filters.platform === "france-travail") {
      next = next.or("url.ilike.%francetravail%,url.ilike.%pole-emploi%");
    } else {
      next = next.ilike("url", `%${PLATFORM_URL_MARKERS[filters.platform]}%`);
    }
  }

  const search = filters.search.trim().replace(/,/g, " ");
  if (search) {
    const pattern = `%${escapeIlike(search)}%`;
    next = next.or(
      `title.ilike.${pattern},company.ilike.${pattern},location.ilike.${pattern},url.ilike.${pattern}`,
    );
  }

  return next;
}

export function applyAdminOffersSort(
  query: OffersFilterQuery,
  sort: AdminOffersSort,
): OffersFilterQuery {
  switch (sort) {
    case "updated_asc":
      return query.order("updated_at", { ascending: true });
    case "created_desc":
      return query.order("created_at", { ascending: false });
    case "created_asc":
      return query.order("created_at", { ascending: true });
    case "title_asc":
      return query.order("title", { ascending: true });
    case "title_desc":
      return query.order("title", { ascending: false });
    case "company_asc":
      return query.order("company", { ascending: true, nullsFirst: false });
    case "company_desc":
      return query.order("company", { ascending: false, nullsFirst: false });
    case "hidden_first":
      return query
        .order("hidden_at", { ascending: false, nullsFirst: false })
        .order("updated_at", { ascending: false });
    case "updated_desc":
    default:
      return query.order("updated_at", { ascending: false });
  }
}

export function adminOffersListMeta(totalFiltered: number, page: number): AdminOffersListMeta {
  const totalPages = Math.max(1, Math.ceil(totalFiltered / ADMIN_OFFERS_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    totalFiltered,
    page: safePage,
    pageSize: ADMIN_OFFERS_PAGE_SIZE,
    totalPages,
  };
}
