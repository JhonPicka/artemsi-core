export type OfferUrlPlatform =
  | "hellowork"
  | "indeed"
  | "linkedin"
  | "wttj"
  | "apec"
  | "france-travail"
  | "other";

export type OfferUrlPlatformFilter = OfferUrlPlatform | "all";

export type OfferVisibilityFilter = "all" | "public" | "private" | "hidden";

export type OfferSourceFilter = "all" | "partner" | "autre" | "indeed";

export const OFFER_URL_PLATFORM_LABELS: Record<OfferUrlPlatform, string> = {
  hellowork: "HelloWork",
  indeed: "Indeed",
  linkedin: "LinkedIn",
  wttj: "Welcome to the Jungle",
  apec: "APEC",
  "france-travail": "France Travail",
  other: "Autre lien",
};

export const OFFER_URL_PLATFORM_FILTERS: { value: OfferUrlPlatformFilter; label: string }[] = [
  { value: "all", label: "Tous les liens" },
  { value: "hellowork", label: "HelloWork" },
  { value: "indeed", label: "Indeed" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "wttj", label: "Welcome to the Jungle" },
  { value: "apec", label: "APEC" },
  { value: "france-travail", label: "France Travail" },
  { value: "other", label: "Autre lien" },
];

export function detectOfferUrlPlatform(url: string | null | undefined): OfferUrlPlatform {
  if (!url?.trim()) return "other";
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    if (host.includes("hellowork")) return "hellowork";
    if (host.includes("indeed")) return "indeed";
    if (host.includes("linkedin")) return "linkedin";
    if (host.includes("welcometothejungle")) return "wttj";
    if (host.includes("apec")) return "apec";
    if (host.includes("francetravail") || host.includes("pole-emploi")) return "france-travail";
    return "other";
  } catch {
    return "other";
  }
}

export function offerUrlHostShort(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "—";
  }
}
