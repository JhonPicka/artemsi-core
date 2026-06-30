import {
  STUDY_DOMAINS,
  STUDY_DOMAIN_LABEL,
  type StudyDomain,
} from "@/lib/constants";
import { inferStudyDomainFromText } from "@/lib/study-domain";
import { createAdminClient } from "@/lib/supabase/admin";

export type DomainDistributionRow = {
  domain: StudyDomain;
  label: string;
  profileCount: number;
  offerCount: number;
  profilePct: number;
  offerPct: number;
  /** % cible d'offres (= part des profils). */
  targetOfferPct: number;
  /** Nombre d'offres idéal pour coller à la demande. */
  targetOfferCount: number;
  /** Offres taguées à ajouter (ou écart vs cible). */
  offersToAdd: number;
  gapPct: number;
};

export type UnclassifiedOfferRow = {
  id: string;
  title: string;
  company: string | null;
  suggestedDomain: StudyDomain | null;
  suggestedLabel: string | null;
};

export type OfferDistributionStats = {
  totalProfiles: number;
  totalOffers: number;
  classifiedOffers: number;
  unclassifiedOffers: number;
  /** Part du catalogue correctement taguée (0–100). */
  catalogReadinessPct: number;
  rows: DomainDistributionRow[];
  priorities: DomainDistributionRow[];
  unclassifiedSamples: UnclassifiedOfferRow[];
};

function pct(count: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((count / total) * 1000) / 10;
}

function countByDomain(
  rows: Array<{ study_domain: string | null }>,
  includeUnclassified = true,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    const raw = row.study_domain?.trim();
    if (!raw) {
      if (includeUnclassified) {
        map.set("NON_CLASSE", (map.get("NON_CLASSE") ?? 0) + 1);
      }
      continue;
    }
    map.set(raw, (map.get(raw) ?? 0) + 1);
  }
  return map;
}

export async function loadOfferDistributionStats(): Promise<OfferDistributionStats> {
  const supabase = createAdminClient();

  const [profilesRes, offersRes, unclassifiedRes, unclassifiedRowsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("study_domain")
      .eq("onboarding_completed", true),
    supabase.from("offers").select("study_domain").is("hidden_at", null),
    supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .is("hidden_at", null)
      .is("study_domain", null),
    supabase
      .from("offers")
      .select("id, title, company, description")
      .is("hidden_at", null)
      .is("study_domain", null)
      .order("updated_at", { ascending: false })
      .limit(20),
  ]);

  if (profilesRes.error) throw new Error(profilesRes.error.message);
  if (offersRes.error) throw new Error(offersRes.error.message);
  if (unclassifiedRes.error) throw new Error(unclassifiedRes.error.message);
  if (unclassifiedRowsRes.error) throw new Error(unclassifiedRowsRes.error.message);

  const profileCounts = countByDomain(profilesRes.data ?? []);
  const offerCounts = countByDomain(offersRes.data ?? [], false);
  const totalProfiles = profilesRes.data?.length ?? 0;
  const totalOffers = offersRes.data?.length ?? 0;
  const unclassifiedOffers = unclassifiedRes.count ?? 0;
  const classifiedOffers = Math.max(0, totalOffers - unclassifiedOffers);
  const catalogReadinessPct =
    totalOffers > 0 ? Math.round((classifiedOffers / totalOffers) * 1000) / 10 : 100;

  const rows: DomainDistributionRow[] = STUDY_DOMAINS.map((domain) => {
    const profileCount = profileCounts.get(domain) ?? 0;
    const offerCount = offerCounts.get(domain) ?? 0;
    const profilePct = pct(profileCount, totalProfiles);
    const offerPct = pct(offerCount, totalOffers);
    const targetOfferPct = profilePct;
    const targetOfferCount =
      totalProfiles > 0 && totalOffers > 0
        ? Math.max(0, Math.round((profilePct / 100) * totalOffers))
        : 0;
    const offersToAdd = Math.max(0, targetOfferCount - offerCount);

    return {
      domain,
      label: STUDY_DOMAIN_LABEL[domain],
      profileCount,
      offerCount,
      profilePct,
      offerPct,
      targetOfferPct,
      targetOfferCount,
      offersToAdd,
      gapPct: Math.round((profilePct - offerPct) * 10) / 10,
    };
  });

  const priorities = [...rows]
    .filter((row) => row.profileCount > 0 && (row.offersToAdd > 0 || row.gapPct > 2))
    .sort(
      (a, b) =>
        b.offersToAdd - a.offersToAdd ||
        b.gapPct - a.gapPct ||
        b.profileCount - a.profileCount,
    )
    .slice(0, 6);

  const unclassifiedSamples: UnclassifiedOfferRow[] = (unclassifiedRowsRes.data ?? []).map(
    (row) => {
      const suggested = inferStudyDomainFromText(
        `${row.title ?? ""} ${row.company ?? ""} ${row.description ?? ""}`,
      );
      return {
        id: row.id as string,
        title: row.title as string,
        company: (row.company as string | null) ?? null,
        suggestedDomain: suggested,
        suggestedLabel: suggested ? STUDY_DOMAIN_LABEL[suggested] : null,
      };
    },
  );

  return {
    totalProfiles,
    totalOffers,
    classifiedOffers,
    unclassifiedOffers,
    catalogReadinessPct,
    rows,
    priorities,
    unclassifiedSamples,
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

export function offersTargetCurve(rows: DomainDistributionRow[]) {
  const max = Math.max(...rows.map((r) => Math.max(r.offerCount, r.targetOfferCount)), 1);
  return rows.map((row, index) => ({
    index,
    label: row.label,
    offerCount: row.offerCount,
    targetOfferCount: row.targetOfferCount,
    offerY: row.offerCount / max,
    targetY: row.targetOfferCount / max,
  }));
}
