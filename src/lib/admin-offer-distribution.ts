import {
  STUDY_DOMAINS,
  STUDY_DOMAIN_LABEL,
  type StudyDomain,
} from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";

export type DomainDistributionRow = {
  domain: StudyDomain;
  label: string;
  profileCount: number;
  offerCount: number;
  profilePct: number;
  offerPct: number;
  /** Positif = plus de profils que d'offres (à enrichir). */
  gapPct: number;
};

export type OfferDistributionStats = {
  totalProfiles: number;
  totalOffers: number;
  unclassifiedOffers: number;
  rows: DomainDistributionRow[];
  priorities: DomainDistributionRow[];
};

function pct(count: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((count / total) * 1000) / 10;
}

function countByDomain(
  rows: Array<{ study_domain: string | null }>,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = row.study_domain?.trim() || "NON_CLASSE";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

export async function loadOfferDistributionStats(): Promise<OfferDistributionStats> {
  const supabase = createAdminClient();

  const [profilesRes, offersRes, unclassifiedRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("study_domain")
      .eq("onboarding_completed", true),
    supabase
      .from("offers")
      .select("study_domain")
      .is("hidden_at", null),
    supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .is("hidden_at", null)
      .is("study_domain", null),
  ]);

  if (profilesRes.error) throw new Error(profilesRes.error.message);
  if (offersRes.error) throw new Error(offersRes.error.message);
  if (unclassifiedRes.error) throw new Error(unclassifiedRes.error.message);

  const profileCounts = countByDomain(profilesRes.data ?? []);
  const offerCounts = countByDomain(offersRes.data ?? []);
  const totalProfiles = profilesRes.data?.length ?? 0;
  const totalOffers = offersRes.data?.length ?? 0;

  const rows: DomainDistributionRow[] = STUDY_DOMAINS.map((domain) => {
    const profileCount = profileCounts.get(domain) ?? 0;
    const offerCount = offerCounts.get(domain) ?? 0;
    const profilePct = pct(profileCount, totalProfiles);
    const offerPct = pct(offerCount, totalOffers);
    return {
      domain,
      label: STUDY_DOMAIN_LABEL[domain],
      profileCount,
      offerCount,
      profilePct,
      offerPct,
      gapPct: Math.round((profilePct - offerPct) * 10) / 10,
    };
  });

  const priorities = [...rows]
    .filter((row) => row.gapPct > 0 && row.profileCount > 0)
    .sort((a, b) => b.gapPct - a.gapPct || b.profileCount - a.profileCount)
    .slice(0, 5);

  return {
    totalProfiles,
    totalOffers,
    unclassifiedOffers: unclassifiedRes.count ?? 0,
    rows,
    priorities,
  };
}

/** Points normalisés (0–1) pour tracer la courbe de demande profils. */
export function profileDistributionCurve(rows: DomainDistributionRow[]) {
  const max = Math.max(...rows.map((r) => r.profileCount), 1);
  return rows.map((row, index) => ({
    index,
    label: row.label,
    x: rows.length > 1 ? index / (rows.length - 1) : 0,
    y: row.profileCount / max,
    count: row.profileCount,
  }));
}
