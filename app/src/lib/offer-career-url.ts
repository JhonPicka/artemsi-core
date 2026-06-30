import { detectOfferUrlPlatform } from "@/lib/admin-offer-url-platform";

/** Hôtes / plateformes jobboard — exclus (pas site carrière employeur). */
const JOBBOARD_HOST_MARKERS = [
  "francetravail",
  "pole-emploi",
  "indeed",
  "hellowork",
  "linkedin",
  "meteojobs",
  "apec",
  "welcometothejungle",
  "monster",
  "jobteaser",
  "cadremploi",
  "regionsjob",
  "keljob",
  "figaroemploi",
  "labonnealternance.apprentissage",
  "labonnealternance",
  "leboncoin",
] as const;

/** ATS / sites carrière connus — signal positif. */
const CAREER_ATS_HOST_MARKERS = [
  "myworkdayjobs",
  "workday.com",
  "greenhouse.io",
  "lever.co",
  "smartrecruiters",
  "teamtailor",
  "workable.com",
  "recrute.fr",
  "digitalrecruiters",
  "wink-lab",
  "kelio",
  "talent-soft",
  "jobylon",
  "bamboohr",
  "ashbyhq",
  "personio",
  "recruitee",
  "softgarden",
  "cegid",
  "eurecia",
] as const;

const BLOCKED_PARTNER_LABEL_MARKERS = [
  "france travail",
  "pole emploi",
  "meteojob",
  "hellowork",
  "indeed",
  "monster",
  "linkedin",
  "le bon coin",
  "leboncoin",
] as const;

export function normalizeApplicationUrlForDedup(url: string): string {
  try {
    const parsed = new URL(url.trim());
    parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    for (const key of [...parsed.searchParams.keys()]) {
      if (key.startsWith("utm_")) parsed.searchParams.delete(key);
    }
    parsed.hash = "";
    const sorted = new URLSearchParams([...parsed.searchParams.entries()].sort());
    parsed.search = sorted.toString();
    let normalized = parsed.toString();
    if (normalized.endsWith("/")) normalized = normalized.slice(0, -1);
    return normalized;
  } catch {
    return url.trim().toLowerCase();
  }
}

/** Cle stable LBA : une offre par URL de candidature (ignore UTM / variantes LBA). */
export function lbaOfferExternalKey(
  applyUrl: string,
  partnerLabel: string | null | undefined,
): string {
  const partner = (partnerLabel ?? "unknown").toLowerCase().replace(/\s+/g, "_");
  return `lba:${partner}:${normalizeApplicationUrlForDedup(applyUrl)}`;
}

export function normalizeUrlHost(url: string): string | null {
  try {
    return new URL(url.trim()).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function isJobboardApplicationUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  const host = normalizeUrlHost(url);
  if (!host) return true;
  if (JOBBOARD_HOST_MARKERS.some((marker) => host.includes(marker))) return true;
  const platform = detectOfferUrlPlatform(url);
  return platform !== "other";
}

export function isKnownCareerAtsHost(url: string | null | undefined): boolean {
  const host = normalizeUrlHost(url ?? "");
  if (!host) return false;
  return CAREER_ATS_HOST_MARKERS.some((marker) => host.includes(marker));
}

/**
 * URL de candidature acceptable : site carrière / ATS employeur, pas jobboard agrégateur.
 */
export function isCareerSiteApplicationUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  if (isJobboardApplicationUrl(url)) return false;
  return true;
}

export function isBlockedLbaPartnerLabel(partnerLabel: string | null | undefined): boolean {
  if (!partnerLabel?.trim()) return false;
  const norm = partnerLabel.toLowerCase();
  return BLOCKED_PARTNER_LABEL_MARKERS.some((marker) => norm.includes(marker));
}
