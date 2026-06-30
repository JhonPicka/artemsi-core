import { normalizeApplicationGuide, type OfferApplicationGuide } from "@/lib/offer-application-guide";
import { normalizeAdminOfferUrl, type AdminOfferBody } from "@/lib/admin-offer-schema";
import {
  clearOfferDeadLinkReports,
  getOfferLinkReportCounts,
} from "@/lib/offer-link-reports";
import { createAdminClient } from "@/lib/supabase/admin";

export type { AdminOffersListMeta, AdminOffersListQuery } from "@/lib/admin-offers-query";
export { ADMIN_OFFERS_PAGE_SIZE, ADMIN_OFFERS_SORT_OPTIONS } from "@/lib/admin-offers-query";
import {
  ADMIN_OFFERS_PAGE_SIZE,
  adminOffersListMeta,
  applyAdminOffersFilters,
  applyAdminOffersSort,
  type AdminOffersListMeta,
  type AdminOffersListQuery,
} from "@/lib/admin-offers-query";

export type AdminOfferListRow = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  url: string | null;
  studyDomain: string | null;
  source: string;
  isPublic: boolean;
  isPartnerExclusive: boolean;
  createdAt: string;
  updatedAt: string;
  hiddenAt: string | null;
  hiddenReason: string | null;
  linkReportCount: number;
};

export type AdminOfferDetail = AdminOfferListRow & {
  description: string;
  applicationGuide: OfferApplicationGuide | null;
};

export type AdminOffersTotals = {
  total: number;
  /** Comme le jobboard candidat Pro : public + non masquée */
  jobboardVisible: number;
  hidden: number;
  privateOnly: number;
  untagged: number;
};

export async function loadAdminOffersTotals(): Promise<AdminOffersTotals> {
  const supabase = createAdminClient();
  const [totalRes, jobboardRes, hiddenRes, privateRes, untaggedRes] = await Promise.all([
    supabase.from("offers").select("id", { count: "exact", head: true }),
    supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .eq("is_public", true)
      .is("hidden_at", null),
    supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .not("hidden_at", "is", null),
    supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .eq("is_public", false)
      .is("hidden_at", null),
    supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .is("hidden_at", null)
      .is("study_domain", null),
  ]);

  if (totalRes.error) throw new Error(totalRes.error.message);
  if (jobboardRes.error) throw new Error(jobboardRes.error.message);
  if (hiddenRes.error) throw new Error(hiddenRes.error.message);
  if (privateRes.error) throw new Error(privateRes.error.message);
  if (untaggedRes.error) throw new Error(untaggedRes.error.message);

  return {
    total: totalRes.count ?? 0,
    jobboardVisible: jobboardRes.count ?? 0,
    hidden: hiddenRes.count ?? 0,
    privateOnly: privateRes.count ?? 0,
    untagged: untaggedRes.count ?? 0,
  };
}

export type AdminOffersPageResult = {
  offers: AdminOfferListRow[];
  meta: AdminOffersListMeta;
};

function mapAdminOfferRows(
  rows: Record<string, unknown>[],
  reportCounts: Map<string, number>,
): AdminOfferListRow[] {
  return rows.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    company: (row.company as string | null) ?? null,
    location: (row.location as string | null) ?? null,
    url: (row.url as string | null) ?? null,
    studyDomain: (row.study_domain as string | null) ?? null,
    source: row.source as string,
    isPublic: Boolean(row.is_public),
    isPartnerExclusive: Boolean(row.is_partner_exclusive),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    hiddenAt: (row.hidden_at as string | null) ?? null,
    hiddenReason: (row.hidden_reason as string | null) ?? null,
    linkReportCount: reportCounts.get(row.id as string) ?? 0,
  }));
}

export async function loadAdminOffersPage(
  query: AdminOffersListQuery,
): Promise<AdminOffersPageResult> {
  const supabase = createAdminClient();
  const selectFields =
    "id, title, company, location, url, study_domain, source, is_public, is_partner_exclusive, hidden_at, hidden_reason, created_at, updated_at";

  let countQuery = supabase.from("offers").select("id", { count: "exact", head: true });
  countQuery = applyAdminOffersFilters(countQuery, query);
  const { count: totalFiltered, error: countError } = await countQuery;

  if (countError) throw new Error(countError.message);

  const meta = adminOffersListMeta(totalFiltered ?? 0, query.page);
  const from = (meta.page - 1) * ADMIN_OFFERS_PAGE_SIZE;
  const to = from + ADMIN_OFFERS_PAGE_SIZE - 1;

  let listQuery = supabase.from("offers").select(selectFields);
  listQuery = applyAdminOffersFilters(listQuery, query);
  listQuery = applyAdminOffersSort(listQuery, query.sort);

  const { data, error } = await listQuery.range(from, to);

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const reportCounts = await getOfferLinkReportCounts(
    supabase,
    rows.map((row) => row.id as string),
  );

  return {
    offers: mapAdminOfferRows(rows as Record<string, unknown>[], reportCounts),
    meta,
  };
}

export async function loadAdminOfferById(id: string): Promise<AdminOfferDetail | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("offers")
    .select(
      "id, title, company, location, url, description, study_domain, source, is_public, is_partner_exclusive, application_guide, hidden_at, hidden_reason, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const reportCounts = await getOfferLinkReportCounts(supabase, [id]);

  return {
    id: data.id as string,
    title: data.title as string,
    company: (data.company as string | null) ?? null,
    location: (data.location as string | null) ?? null,
    url: (data.url as string | null) ?? null,
    studyDomain: (data.study_domain as string | null) ?? null,
    description: (data.description as string | null) ?? "",
    source: data.source as string,
    isPublic: Boolean(data.is_public),
    isPartnerExclusive: Boolean(data.is_partner_exclusive),
    applicationGuide: normalizeApplicationGuide(data.application_guide),
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    hiddenAt: (data.hidden_at as string | null) ?? null,
    hiddenReason: (data.hidden_reason as string | null) ?? null,
    linkReportCount: reportCounts.get(id) ?? 0,
  };
}

export async function updateAdminOffer(
  id: string,
  body: AdminOfferBody,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createAdminClient();

  const { data: current } = await supabase
    .from("offers")
    .select("id, url, hidden_at")
    .eq("id", id)
    .maybeSingle();
  if (!current) {
    return { ok: false, error: "Offre introuvable." };
  }

  const normalizedUrl = normalizeAdminOfferUrl(body.url, body.isPartnerExclusive);
  const urlChanged = (current.url as string | null) !== normalizedUrl;
  const shouldRestoreVisibility = urlChanged && Boolean(current.hidden_at);

  if (normalizedUrl) {
    const { data: urlConflict } = await supabase
      .from("offers")
      .select("id, title")
      .eq("url", normalizedUrl)
      .neq("id", id)
      .maybeSingle();

    if (urlConflict) {
      return { ok: false, error: "Cette URL est deja utilisee par une autre offre." };
    }
  }

  const applicationGuide = normalizeApplicationGuide(body.applicationGuide);
  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("offers")
    .update({
      title: body.title,
      company: body.company ?? null,
      location: body.location ?? null,
      url: normalizedUrl,
      description: body.description,
      study_domain: body.studyDomain,
      source: body.source,
      is_public: shouldRestoreVisibility ? true : body.isPublic,
      is_partner_exclusive: body.isPartnerExclusive,
      application_guide: applicationGuide,
      ...(shouldRestoreVisibility
        ? { hidden_at: null, hidden_reason: null }
        : {}),
      updated_at: now,
    })
    .eq("id", id);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  if (shouldRestoreVisibility) {
    await clearOfferDeadLinkReports(supabase, id);
  }

  return { ok: true };
}

export async function deleteAdminOffer(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createAdminClient();

  const { data: current } = await supabase.from("offers").select("id").eq("id", id).maybeSingle();
  if (!current) {
    return { ok: false, error: "Offre introuvable." };
  }

  const { error } = await supabase.from("offers").delete().eq("id", id);
  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
