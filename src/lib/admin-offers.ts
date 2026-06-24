import { normalizeApplicationGuide, type OfferApplicationGuide } from "@/lib/offer-application-guide";
import type { AdminOfferBody } from "@/lib/admin-offer-schema";
import {
  clearOfferDeadLinkReports,
  getOfferLinkReportCounts,
} from "@/lib/offer-link-reports";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminOfferListRow = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  url: string;
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

export async function loadAdminOffersList(limit = 100): Promise<AdminOfferListRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("offers")
    .select(
      "id, title, company, location, url, source, is_public, is_partner_exclusive, hidden_at, hidden_reason, created_at, updated_at",
    )
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const reportCounts = await getOfferLinkReportCounts(
    supabase,
    rows.map((row) => row.id as string),
  );

  const mapped = rows.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    company: (row.company as string | null) ?? null,
    location: (row.location as string | null) ?? null,
    url: row.url as string,
    source: row.source as string,
    isPublic: Boolean(row.is_public),
    isPartnerExclusive: Boolean(row.is_partner_exclusive),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    hiddenAt: (row.hidden_at as string | null) ?? null,
    hiddenReason: (row.hidden_reason as string | null) ?? null,
    linkReportCount: reportCounts.get(row.id as string) ?? 0,
  }));

  return mapped.sort((a, b) => {
    if (a.hiddenAt && !b.hiddenAt) return -1;
    if (!a.hiddenAt && b.hiddenAt) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export async function loadAdminOfferById(id: string): Promise<AdminOfferDetail | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("offers")
    .select(
      "id, title, company, location, url, description, source, is_public, is_partner_exclusive, application_guide, hidden_at, hidden_reason, created_at, updated_at",
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
    url: data.url as string,
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

  const urlChanged = (current.url as string) !== body.url;
  const shouldRestoreVisibility = urlChanged && Boolean(current.hidden_at);

  const { data: urlConflict } = await supabase
    .from("offers")
    .select("id, title")
    .eq("url", body.url)
    .neq("id", id)
    .maybeSingle();

  if (urlConflict) {
    return { ok: false, error: "Cette URL est deja utilisee par une autre offre." };
  }

  const applicationGuide = normalizeApplicationGuide(body.applicationGuide);
  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("offers")
    .update({
      title: body.title,
      company: body.company ?? null,
      location: body.location ?? null,
      url: body.url,
      description: body.description,
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
