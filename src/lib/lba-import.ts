import {
  isBlockedLbaPartnerLabel,
  isCareerSiteApplicationUrl,
  normalizeApplicationUrlForDedup,
} from "@/lib/offer-career-url";
import { sanitizeOfferTitle } from "@/lib/offer-title-sanitize";
import { romeCodesForStudyDomain, inferStudyDomainFromRomeCodes } from "@/lib/lba-rome-mapping";
import { searchLbaJobs, type LbaNormalizedJob, isLbaImportConfigured } from "@/lib/lba-client";
import {
  profileMatchesOffer,
  type MatchableOffer,
  type MatchableProfile,
} from "@/lib/offer-matching";
import { getRegionGeopoint } from "@/lib/region-geopoints";
import { loadMatchableProfiles } from "@/lib/load-matchable-profiles";
import { createAdminClient } from "@/lib/supabase/admin";

export type LbaImportOptions = {
  /** Limite les requêtes LBA à ces comptes (ex. import manuel admin). */
  profileUserIds?: string[];
};

export type LbaImportResult = {
  configured: boolean;
  searchQueries: number;
  fetched: number;
  accepted: number;
  inserted: number;
  updated: number;
  skippedJobboard: number;
  skippedRecruteur: number;
  skippedPartner: number;
  skippedNoProfileMatch: number;
  skippedDuplicateUrl: number;
  profilesConsidered: number;
  errors: string[];
};

type SearchQuery = {
  key: string;
  latitude: number;
  longitude: number;
  romeCodes: string[];
  studyDomain: string | null;
};

function parseRadiusKm(): number {
  const raw = Number(process.env.LBA_SEARCH_RADIUS_KM ?? "50");
  return Number.isFinite(raw) && raw > 0 ? Math.min(raw, 200) : 50;
}

function parseSearchLimit(): number {
  const raw = Number(process.env.LBA_SEARCH_LIMIT ?? "150");
  return Number.isFinite(raw) && raw > 0 ? Math.min(raw, 150) : 150;
}

async function loadProfilesForLbaImport(
  supabase: ReturnType<typeof createAdminClient>,
  userIds: string[],
): Promise<Awaited<ReturnType<typeof loadMatchableProfiles>>> {
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id,target_job,regions,contract_type,study_domain,onboarding_completed")
    .in("id", userIds);

  if (error) throw new Error(error.message);

  return (data ?? []).map((p) => ({
    id: p.id as string,
    target_job: p.target_job as string | null,
    regions: p.regions as string[] | null,
    contract_type: p.contract_type as string | null,
    study_domain: p.study_domain as string | null,
    interest_keywords: [] as string[],
  }));
}

async function resolveImportProfiles(
  options?: LbaImportOptions,
): Promise<MatchableProfile[]> {
  const supabase = createAdminClient();
  let profiles = await loadMatchableProfiles(supabase);

  if (options?.profileUserIds?.length) {
    const allowed = new Set(options.profileUserIds);
    profiles = profiles.filter((profile) => allowed.has(profile.id));
    if (profiles.length === 0) {
      profiles = await loadProfilesForLbaImport(supabase, options.profileUserIds);
    }
  }

  return profiles;
}

async function buildUniqueSearchQueries(
  profiles: MatchableProfile[],
): Promise<SearchQuery[]> {
  const map = new Map<string, SearchQuery>();

  for (const profile of profiles) {
    const romes = romeCodesForStudyDomain(profile.study_domain);
    const regions = profile.regions ?? [];
    if (regions.length === 0) continue;

    for (const region of regions) {
      const geopoint = getRegionGeopoint(region);
      if (!geopoint) continue;

      const romeKey = romes.slice(0, 6).sort().join(",");
      const key = `${geopoint.latitude.toFixed(3)}:${geopoint.longitude.toFixed(3)}:${romeKey}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          latitude: geopoint.latitude,
          longitude: geopoint.longitude,
          romeCodes: romes,
          studyDomain: profile.study_domain,
        });
      }
    }
  }

  return Array.from(map.values());
}

function resolveStudyDomain(
  job: LbaNormalizedJob,
  studyDomainHint: string | null,
): string | null {
  return studyDomainHint ?? inferStudyDomainFromRomeCodes(job.romeCodes) ?? null;
}

function lbaJobToMatchableOffer(
  job: LbaNormalizedJob,
  studyDomainHint: string | null,
): MatchableOffer {
  return {
    id: job.externalKey,
    title: job.title,
    company: job.company,
    location: job.location,
    summary: job.description,
    study_domain: resolveStudyDomain(job, studyDomainHint),
    is_partner_exclusive: false,
  };
}

function matchesAnyImportProfile(
  profiles: MatchableProfile[],
  job: LbaNormalizedJob,
  studyDomainHint: string | null,
): boolean {
  if (profiles.length === 0) return false;
  const offer = lbaJobToMatchableOffer(job, studyDomainHint);
  return profiles.some((profile) => profileMatchesOffer(profile, offer));
}

function shouldAcceptJob(job: LbaNormalizedJob): {
  accept: boolean;
  reason?: "recruteur" | "partner" | "jobboard";
} {
  if (job.kind === "recruteur") return { accept: false, reason: "recruteur" };
  if (isBlockedLbaPartnerLabel(job.partnerLabel)) return { accept: false, reason: "partner" };
  if (!isCareerSiteApplicationUrl(job.applyUrl)) return { accept: false, reason: "jobboard" };
  return { accept: true };
}

async function loadExistingApplicationUrlKeys(
  supabase: ReturnType<typeof createAdminClient>,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("offers")
    .select("url")
    .not("url", "is", null)
    .limit(5000);

  if (error) throw new Error(error.message);

  const keys = new Set<string>();
  for (const row of data ?? []) {
    if (row.url) keys.add(normalizeApplicationUrlForDedup(String(row.url)));
  }
  return keys;
}

async function upsertLbaOffer(
  supabase: ReturnType<typeof createAdminClient>,
  job: LbaNormalizedJob,
  studyDomainHint: string | null,
  knownApplicationUrls: Set<string>,
): Promise<"inserted" | "updated" | "unchanged" | "duplicate"> {
  const studyDomain = resolveStudyDomain(job, studyDomainHint);

  const row = {
    title: sanitizeOfferTitle(job.title).slice(0, 500),
    company: job.company?.slice(0, 300) ?? null,
    location: job.location?.slice(0, 300) ?? null,
    url: job.applyUrl,
    description: job.description.slice(0, 12_000) || null,
    source: "autre" as const,
    is_public: true,
    is_partner_exclusive: false,
    study_domain: studyDomain,
    external_key: job.externalKey,
    hidden_at: null,
    hidden_reason: null,
  };

  const { data: existing, error: readError } = await supabase
    .from("offers")
    .select("id")
    .eq("external_key", job.externalKey)
    .maybeSingle();

  if (readError) throw new Error(readError.message);

  const applyUrlKey = normalizeApplicationUrlForDedup(job.applyUrl);

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("offers")
      .update({
        title: row.title,
        company: row.company,
        location: row.location,
        url: row.url,
        description: row.description,
        study_domain: row.study_domain,
        is_public: true,
        hidden_at: null,
        hidden_reason: null,
      })
      .eq("id", existing.id);

    if (updateError) throw new Error(updateError.message);
    knownApplicationUrls.add(applyUrlKey);
    return "updated";
  }

  if (knownApplicationUrls.has(applyUrlKey)) {
    return "duplicate";
  }

  const { error: insertError } = await supabase.from("offers").insert(row);
  if (insertError) throw new Error(insertError.message);
  knownApplicationUrls.add(applyUrlKey);
  return "inserted";
}

export async function runLbaOfferImport(options?: LbaImportOptions): Promise<LbaImportResult> {
  const result: LbaImportResult = {
    configured: isLbaImportConfigured(),
    searchQueries: 0,
    fetched: 0,
    accepted: 0,
    inserted: 0,
    updated: 0,
    skippedJobboard: 0,
    skippedRecruteur: 0,
    skippedPartner: 0,
    skippedNoProfileMatch: 0,
    skippedDuplicateUrl: 0,
    profilesConsidered: 0,
    errors: [],
  };

  if (!result.configured) {
    result.errors.push("LBA_API_TOKEN non configuré — import ignoré.");
    return result;
  }

  const supabase = createAdminClient();
  const profiles = await resolveImportProfiles(options);
  result.profilesConsidered = profiles.length;

  if (profiles.length === 0) {
    result.errors.push("Aucun profil disponible — import ignoré.");
    return result;
  }

  const queries = await buildUniqueSearchQueries(profiles);
  result.searchQueries = queries.length;

  if (queries.length === 0) {
    result.errors.push(
      "Aucune recherche LBA possible — vérifiez régions et domaine d'étude sur les profils.",
    );
    return result;
  }

  const radiusKm = parseRadiusKm();
  const limit = parseSearchLimit();
  const knownApplicationUrls = await loadExistingApplicationUrlKeys(supabase);
  const seenExternal = new Set<string>();
  const seenApplicationUrls = new Set<string>();
  const acceptedJobs: { job: LbaNormalizedJob; studyDomain: string | null }[] = [];

  for (const query of queries) {
    try {
      const jobs = await searchLbaJobs({
        latitude: query.latitude,
        longitude: query.longitude,
        radiusKm,
        romeCodes: query.romeCodes,
        limit,
      });
      result.fetched += jobs.length;

      for (const job of jobs) {
        if (seenExternal.has(job.externalKey)) continue;
        seenExternal.add(job.externalKey);

        const applyUrlKey = normalizeApplicationUrlForDedup(job.applyUrl);
        if (seenApplicationUrls.has(applyUrlKey)) {
          result.skippedDuplicateUrl += 1;
          continue;
        }
        seenApplicationUrls.add(applyUrlKey);

        const gate = shouldAcceptJob(job);
        if (!gate.accept) {
          if (gate.reason === "recruteur") result.skippedRecruteur += 1;
          else if (gate.reason === "partner") result.skippedPartner += 1;
          else result.skippedJobboard += 1;
          continue;
        }

        if (!matchesAnyImportProfile(profiles, job, query.studyDomain)) {
          result.skippedNoProfileMatch += 1;
          continue;
        }

        acceptedJobs.push({ job, studyDomain: query.studyDomain });
        result.accepted += 1;
      }
    } catch (error) {
      result.errors.push(
        `Recherche ${query.key}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  for (const { job, studyDomain } of acceptedJobs) {
    try {
      const outcome = await upsertLbaOffer(supabase, job, studyDomain, knownApplicationUrls);
      if (outcome === "inserted") result.inserted += 1;
      else if (outcome === "updated") result.updated += 1;
      else if (outcome === "duplicate") result.skippedDuplicateUrl += 1;
    } catch (error) {
      result.errors.push(
        `Upsert ${job.externalKey}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return result;
}
