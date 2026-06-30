import { lbaOfferExternalKey } from "@/lib/offer-career-url";
import { sanitizeOfferTitle } from "@/lib/offer-title-sanitize";

const DEFAULT_LBA_BASE_URL = "https://api.apprentissage.beta.gouv.fr";

export type LbaSearchParams = {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  romeCodes: string[];
  limit?: number;
};

export type LbaNormalizedJob = {
  externalKey: string;
  partnerLabel: string | null;
  title: string;
  company: string | null;
  location: string | null;
  description: string;
  applyUrl: string;
  romeCodes: string[];
  kind: "offre" | "recruteur";
};

export function isLbaImportConfigured(): boolean {
  return Boolean(process.env.LBA_API_TOKEN?.trim());
}

function lbaBaseUrl(): string {
  return (process.env.LBA_API_BASE_URL?.trim() || DEFAULT_LBA_BASE_URL).replace(/\/$/, "");
}

function lbaApiToken(): string {
  const token = process.env.LBA_API_TOKEN?.trim();
  if (!token) {
    throw new Error("LBA_API_TOKEN manquant — créez un jeton sur api.apprentissage.beta.gouv.fr");
  }
  return token;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function pickString(obj: Record<string, unknown> | null, ...keys: string[]): string | null {
  if (!obj) return null;
  for (const key of keys) {
    const v = asString(obj[key]);
    if (v) return v;
  }
  return null;
}

function collectJobArrays(payload: unknown): unknown[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;

  const root = asRecord(payload);
  if (!root) return [];

  const buckets: unknown[] = [];

  const arrayKeys = [
    "jobs",
    "offres_emploi_lba",
    "offres_emploi_partenaires",
    "offres",
    "results",
    "data",
  ];

  for (const key of arrayKeys) {
    const value = root[key];
    if (Array.isArray(value)) buckets.push(...value);
    const nested = asRecord(value);
    if (nested) {
      for (const subKey of ["offres_emploi_lba", "offres_emploi_partenaires", "jobs"]) {
        const sub = nested[subKey];
        if (Array.isArray(sub)) buckets.push(...sub);
      }
    }
  }

  if (buckets.length > 0) return buckets;

  for (const key of ["data", "result"] as const) {
    const nested: unknown = root[key];
    if (nested && nested !== root) {
      const inner = collectJobArrays(nested);
      if (inner.length > 0) return inner;
    }
  }

  return buckets;
}

function formatLocation(workplace: Record<string, unknown> | null): string | null {
  const location = asRecord(workplace?.location);
  const address = asRecord(location?.address);
  const parts = [
    pickString(address, "city", "commune", "label"),
    pickString(address, "zipCode", "postcode"),
    pickString(address, "department", "departement"),
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");

  const geopoint = asRecord(location?.geopoint);
  const lat = geopoint?.lat ?? geopoint?.latitude;
  const lon = geopoint?.lon ?? geopoint?.longitude;
  if (typeof lat === "number" && typeof lon === "number") {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }

  return pickString(workplace, "name", "brand", "legal_name");
}

function parseRomeCodes(offer: Record<string, unknown> | null): string[] {
  if (!offer) return [];
  const raw = offer.rome_codes ?? offer.romes ?? offer.romeCodes;
  if (Array.isArray(raw)) {
    return raw.map((v) => asString(v)).filter((v): v is string => Boolean(v));
  }
  const single = asString(raw);
  return single ? [single] : [];
}

function parseLbaJob(raw: unknown): LbaNormalizedJob | null {
  const row = asRecord(raw);
  if (!row) return null;

  const identifier = asRecord(row.identifier) ?? row;
  const partnerLabel = pickString(identifier, "partner_label", "partnerLabel");

  const offer = asRecord(row.offer) ?? row;
  const workplace = asRecord(row.workplace) ?? asRecord(offer.workplace);
  const apply = asRecord(row.apply) ?? asRecord(offer.apply);

  const applyUrl = pickString(apply, "url", "apply_url");
  if (!applyUrl) return null;

  const title = sanitizeOfferTitle(pickString(offer, "title", "intitule") ?? "Alternance");
  const company =
    pickString(workplace, "name", "brand", "legal_name") ??
    pickString(row, "company", "entreprise");

  const description =
    pickString(offer, "description", "job_description") ??
    pickString(offer, "desired_skills") ??
    "";

  const romeCodes = parseRomeCodes(offer);
  const kind: LbaNormalizedJob["kind"] =
    row.recruteur || row.kind === "recruteurs_lba" ? "recruteur" : "offre";

  const externalKey = lbaOfferExternalKey(applyUrl, partnerLabel);

  return {
    externalKey,
    partnerLabel,
    title,
    company,
    location: formatLocation(workplace),
    description,
    applyUrl,
    romeCodes,
    kind,
  };
}

export async function searchLbaJobs(params: LbaSearchParams): Promise<LbaNormalizedJob[]> {
  const url = new URL(`${lbaBaseUrl()}/api/job/v1/search`);
  url.searchParams.set("latitude", String(params.latitude));
  url.searchParams.set("longitude", String(params.longitude));
  url.searchParams.set("radius", String(params.radiusKm ?? 50));
  if (params.limit) url.searchParams.set("limit", String(params.limit));

  const uniqueRomes = Array.from(new Set(params.romeCodes.map((c) => c.toUpperCase()).filter(Boolean)));
  if (uniqueRomes.length > 0) {
    url.searchParams.set("romes", uniqueRomes.join(","));
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${lbaApiToken()}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`LBA search ${response.status}: ${body.slice(0, 300)}`);
  }

  const payload: unknown = await response.json();
  const items = collectJobArrays(payload);
  const parsed: LbaNormalizedJob[] = [];

  for (const item of items) {
    const job = parseLbaJob(item);
    if (job) parsed.push(job);
  }

  return parsed;
}
