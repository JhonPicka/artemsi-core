import { normalizeApplicationGuide, type OfferApplicationGuide } from "@/lib/offer-application-guide";
import type { AdminOfferBody } from "@/lib/admin-offer-schema";
import { runOfferMatching } from "@/lib/run-offer-matching";
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
      "id, title, company, location, url, source, is_public, is_partner_exclusive, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    company: (row.company as string | null) ?? null,
    location: (row.location as string | null) ?? null,
    url: row.url as string,
    source: row.source as string,
    isPublic: Boolean(row.is_public),
    isPartnerExclusive: Boolean(row.is_partner_exclusive),
    createdAt: row.created_at as string,
  }));
}

export async function loadAdminOfferById(id: string): Promise<AdminOfferDetail | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("offers")
    .select(
      "id, title, company, location, url, description, source, is_public, is_partner_exclusive, application_guide, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

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
  };
}

export async function updateAdminOffer(
  id: string,
  body: AdminOfferBody,
): Promise<{ ok: true; matching: Awaited<ReturnType<typeof runOfferMatching>> | null } | { ok: false; error: string }> {
  const supabase = createAdminClient();

  const { data: current } = await supabase.from("offers").select("id").eq("id", id).maybeSingle();
  if (!current) {
    return { ok: false, error: "Offre introuvable." };
  }

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

  const { error: updateError } = await supabase
    .from("offers")
    .update({
      title: body.title,
      company: body.company ?? null,
      location: body.location ?? null,
      url: body.url,
      description: body.description,
      source: body.source,
      is_public: body.isPublic,
      is_partner_exclusive: body.isPartnerExclusive,
      application_guide: applicationGuide,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  let matching = null;
  if (body.runMatching) {
    matching = await runOfferMatching({ dryRun: false });
  }

  return { ok: true, matching };
}
