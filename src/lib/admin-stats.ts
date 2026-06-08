import { getAdminEmail, getAdminUserId } from "@/lib/admin-auth";
import {
  ACQUISITION_SOURCE_LABEL,
  ALTERNANCE_RHYTHM_LABEL,
  APPLICATIONS_SENT_RANGE_LABEL,
  CONTRACT_DURATION_LABEL,
  CONTRACT_TYPE_LABEL,
  PREFERRED_SECTOR_LABEL,
  SEARCH_LEVEL_LABEL,
  STUDY_DOMAIN_LABEL,
  STUDY_LEVEL_LABEL,
  type AcquisitionSource,
  type AlternanceRhythm,
  type ApplicationsSentRange,
  type ContractDuration,
  type ContractType,
  type PreferredSector,
  type SearchLevel,
  type StudyDomain,
  type StudyLevel,
} from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";

export type RankedItem = { label: string; count: number };

export type AdminCandidateProfile = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  schoolName: string | null;
  studyLevel: string | null;
  studyDomain: string | null;
  targetJob: string | null;
  regions: string[];
  startDate: string | null;
  contractType: string | null;
  contractDuration: string | null;
  alternanceRhythm: string | null;
  alternanceRhythmOther: string | null;
  preferredSectors: string[];
  acquisitionSource: string | null;
  acquisitionSourceOther: string | null;
  applicationsSentRange: string | null;
  searchLevel: string | null;
  onboardingCompleted: boolean;
  subscriptionStatus: string;
  createdAt: string;
  updatedAt: string;
};

export type ChartSlice = { label: string; value: number; color: string };

export type AdminDashboardStats = {
  generatedAt: string;
  charts: {
    profileCompletion: ChartSlice[];
    subscriptions: ChartSlice[];
    contractTypes: ChartSlice[];
    studyDomains: ChartSlice[];
    acquisitionSources: ChartSlice[];
    searchLevels: ChartSlice[];
    applicationsSentRanges: ChartSlice[];
    preferredSectors: ChartSlice[];
    alternanceRhythms: ChartSlice[];
  };
  kpis: {
    totalAccounts: number;
    onboardingCompleted: number;
    onboardingPending: number;
    activeSubscriptions: number;
    paidNotActivated: number;
    signupsLast7Days: number;
    mrrEstimateEur: number;
    totalOffers: number;
    publicOffers: number;
    assignmentsTotal: number;
    assignmentsLast7Days: number;
    applicationsTotal: number;
    auditsPending: number;
    billingActiveTotal: number;
  };
  topTargetJobs: RankedItem[];
  topStudyDomains: RankedItem[];
  topRegions: RankedItem[];
  contractTypes: RankedItem[];
  topAcquisitionSources: RankedItem[];
  topSearchLevels: RankedItem[];
  topApplicationsSentRanges: RankedItem[];
  topPreferredSectors: RankedItem[];
  topAlternanceRhythms: RankedItem[];
  candidates: AdminCandidateProfile[];
};

const MONTHLY_PRICE_EUR = 19.9;

const PIE_COLORS = [
  "var(--admin-chart-1)",
  "var(--admin-chart-2)",
  "var(--admin-chart-3)",
  "var(--admin-chart-4)",
  "var(--admin-chart-5)",
  "var(--admin-chart-6)",
];

function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function countByField<T extends string | null | undefined>(
  rows: T[],
  labelFor?: (value: string) => string,
): RankedItem[] {
  const map = new Map<string, number>();
  for (const raw of rows) {
    if (!raw?.trim()) continue;
    const key = labelFor ? labelFor(raw) : raw.trim();
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function countRegions(rows: (string[] | null)[]): RankedItem[] {
  const map = new Map<string, number>();
  for (const regions of rows) {
    for (const r of regions ?? []) {
      if (!r?.trim()) continue;
      map.set(r, (map.get(r) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function countMultiSelect(
  rows: (string[] | null)[],
  labelFor: (value: string) => string,
): RankedItem[] {
  const map = new Map<string, number>();
  for (const items of rows) {
    for (const raw of items ?? []) {
      if (!raw?.trim()) continue;
      const label = labelFor(raw);
      map.set(label, (map.get(label) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function toSlices(entries: { label: string; value: number }[], max = 6): ChartSlice[] {
  return entries
    .filter((e) => e.value > 0)
    .slice(0, max)
    .map((e, i) => ({
      label: e.label,
      value: e.value,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
}

function rankedToSlices(items: RankedItem[], max = 6): ChartSlice[] {
  return toSlices(
    items.map((item) => ({ label: item.label, value: item.count })),
    max,
  );
}

function mapCandidate(row: Record<string, unknown>): AdminCandidateProfile {
  return {
    id: row.id as string,
    email: row.email as string,
    fullName: (row.full_name as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    schoolName: (row.school_name as string | null) ?? null,
    studyLevel: row.study_level
      ? (STUDY_LEVEL_LABEL[row.study_level as StudyLevel] ?? String(row.study_level))
      : null,
    studyDomain: row.study_domain
      ? (STUDY_DOMAIN_LABEL[row.study_domain as StudyDomain] ?? String(row.study_domain))
      : null,
    targetJob: (row.target_job as string | null) ?? null,
    regions: (row.regions as string[] | null) ?? [],
    startDate: (row.start_date as string | null) ?? null,
    contractType: row.contract_type
      ? (CONTRACT_TYPE_LABEL[row.contract_type as ContractType] ?? String(row.contract_type))
      : null,
    contractDuration: row.contract_duration
      ? (CONTRACT_DURATION_LABEL[row.contract_duration as ContractDuration] ??
        String(row.contract_duration))
      : null,
    alternanceRhythm: row.alternance_rhythm
      ? (ALTERNANCE_RHYTHM_LABEL[row.alternance_rhythm as AlternanceRhythm] ??
        String(row.alternance_rhythm))
      : null,
    alternanceRhythmOther: (row.alternance_rhythm_other as string | null) ?? null,
    preferredSectors: ((row.preferred_sectors as string[] | null) ?? []).map(
      (sector) => PREFERRED_SECTOR_LABEL[sector as PreferredSector] ?? sector,
    ),
    acquisitionSource: row.acquisition_source
      ? (ACQUISITION_SOURCE_LABEL[row.acquisition_source as AcquisitionSource] ??
        String(row.acquisition_source))
      : null,
    acquisitionSourceOther: (row.acquisition_source_other as string | null) ?? null,
    applicationsSentRange: row.applications_sent_range
      ? (APPLICATIONS_SENT_RANGE_LABEL[row.applications_sent_range as ApplicationsSentRange] ??
        String(row.applications_sent_range))
      : null,
    searchLevel: row.search_level
      ? (SEARCH_LEVEL_LABEL[row.search_level as SearchLevel] ?? String(row.search_level))
      : null,
    onboardingCompleted: Boolean(row.onboarding_completed),
    subscriptionStatus: String(row.subscription_status ?? "inactive"),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function loadAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = createAdminClient();
  const adminEmail = getAdminEmail();
  const since7d = daysAgoIso(7);

  const adminUserId = getAdminUserId();

  const profileFilter = <T>(query: T): T => {
    let filtered = (query as unknown as { neq: (column: string, value: string) => T }).neq(
      "email",
      adminEmail,
    );
    if (adminUserId) {
      filtered = (filtered as unknown as { neq: (column: string, value: string) => T }).neq(
        "id",
        adminUserId,
      );
    }
    return filtered;
  };

  const profileSelect =
    "id, email, full_name, phone, school_name, study_level, study_domain, target_job, regions, start_date, contract_type, contract_duration, alternance_rhythm, alternance_rhythm_other, preferred_sectors, acquisition_source, acquisition_source_other, applications_sent_range, search_level, onboarding_completed, subscription_status, created_at, updated_at";

  const [
    { count: totalAccounts },
    { count: onboardingCompleted },
    { count: activeSubscriptions },
    { count: signupsLast7Days },
    { data: profileRows },
    { count: totalOffers },
    { count: publicOffers },
    { count: assignmentsTotal },
    { count: assignmentsLast7Days },
    { count: applicationsTotal },
    { count: auditsPending },
    { data: candidateRows },
    { count: billingActiveTotal },
  ] = await Promise.all([
    profileFilter(supabase.from("profiles").select("id", { count: "exact", head: true })),
    profileFilter(
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("onboarding_completed", true),
    ),
    profileFilter(
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("subscription_status", "active"),
    ),
    profileFilter(
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since7d),
    ),
    profileFilter(
      supabase
        .from("profiles")
        .select(
          "target_job, study_domain, regions, contract_type, acquisition_source, applications_sent_range, search_level, preferred_sectors, alternance_rhythm, email, subscription_status, onboarding_completed",
        ),
    ),
    supabase.from("offers").select("id", { count: "exact", head: true }),
    supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .eq("is_public", true),
    supabase.from("offer_assignments").select("id", { count: "exact", head: true }),
    supabase
      .from("offer_assignments")
      .select("id", { count: "exact", head: true })
      .gte("assigned_at", since7d),
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase
      .from("audit_bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    profileFilter(
      supabase
        .from("profiles")
        .select(profileSelect)
        .order("created_at", { ascending: false })
        .limit(200),
    ),
    supabase
      .from("billing_customers")
      .select("email", { count: "exact", head: true })
      .eq("subscription_status", "active"),
  ]);

  const profiles = profileRows ?? [];

  let onboardingDone = 0;
  let onboardingPending = 0;
  let paidNotActivated = 0;
  const subscriptionCounts = { active: 0, inactive: 0, past_due: 0, canceled: 0 };

  for (const p of profiles) {
    if (p.onboarding_completed) onboardingDone += 1;
    else onboardingPending += 1;

    const status = String(p.subscription_status ?? "inactive");
    if (status === "active" && !p.onboarding_completed) {
      paidNotActivated += 1;
    }
    if (status in subscriptionCounts) {
      subscriptionCounts[status as keyof typeof subscriptionCounts] += 1;
    } else {
      subscriptionCounts.inactive += 1;
    }
  }

  const topTargetJobs = countByField(
    profiles.map((p) => p.target_job as string | null),
    (v) => v.trim(),
  ).slice(0, 8);

  const topStudyDomains = countByField(
    profiles.map((p) => {
      const code = p.study_domain as StudyDomain | null;
      if (!code) return null;
      return STUDY_DOMAIN_LABEL[code] ?? code;
    }),
  ).slice(0, 8);

  const topRegions = countRegions(profiles.map((p) => p.regions as string[] | null)).slice(0, 8);

  const contractTypes = countByField(
    profiles.map((p) => {
      const code = p.contract_type as ContractType | null;
      if (!code) return null;
      return CONTRACT_TYPE_LABEL[code] ?? code;
    }),
  );

  const topAcquisitionSources = countByField(
    profiles.map((p) => {
      const code = p.acquisition_source as AcquisitionSource | null;
      if (!code) return null;
      return ACQUISITION_SOURCE_LABEL[code] ?? code;
    }),
  );

  const topSearchLevels = countByField(
    profiles.map((p) => {
      const code = p.search_level as SearchLevel | null;
      if (!code) return null;
      return SEARCH_LEVEL_LABEL[code] ?? code;
    }),
  );

  const topApplicationsSentRanges = countByField(
    profiles.map((p) => {
      const code = p.applications_sent_range as ApplicationsSentRange | null;
      if (!code) return null;
      return APPLICATIONS_SENT_RANGE_LABEL[code] ?? code;
    }),
  );

  const topPreferredSectors = countMultiSelect(
    profiles.map((p) => p.preferred_sectors as string[] | null),
    (sector) => PREFERRED_SECTOR_LABEL[sector as PreferredSector] ?? sector,
  ).slice(0, 8);

  const topAlternanceRhythms = countByField(
    profiles.map((p) => {
      const code = p.alternance_rhythm as AlternanceRhythm | null;
      if (!code || code === "NOT_APPLICABLE") return null;
      return ALTERNANCE_RHYTHM_LABEL[code] ?? code;
    }),
  );

  const candidates = (candidateRows ?? []).map((row) =>
    mapCandidate(row as Record<string, unknown>),
  );

  const activeCount = activeSubscriptions ?? 0;

  return {
    generatedAt: new Date().toISOString(),
    charts: {
      profileCompletion: toSlices([
        { label: "Profil complet", value: onboardingDone },
        { label: "En cours", value: onboardingPending },
      ]),
      subscriptions: toSlices([
        { label: "Actifs", value: subscriptionCounts.active },
        { label: "Inactifs", value: subscriptionCounts.inactive },
        { label: "Impayés", value: subscriptionCounts.past_due },
        { label: "Résiliés", value: subscriptionCounts.canceled },
      ]),
      contractTypes: rankedToSlices(contractTypes),
      studyDomains: rankedToSlices(topStudyDomains),
      acquisitionSources: rankedToSlices(topAcquisitionSources),
      searchLevels: rankedToSlices(topSearchLevels),
      applicationsSentRanges: rankedToSlices(topApplicationsSentRanges),
      preferredSectors: rankedToSlices(topPreferredSectors),
      alternanceRhythms: rankedToSlices(topAlternanceRhythms),
    },
    kpis: {
      totalAccounts: totalAccounts ?? 0,
      onboardingCompleted: onboardingCompleted ?? 0,
      onboardingPending: (totalAccounts ?? 0) - (onboardingCompleted ?? 0),
      activeSubscriptions: activeCount,
      paidNotActivated,
      signupsLast7Days: signupsLast7Days ?? 0,
      mrrEstimateEur: Math.round(activeCount * MONTHLY_PRICE_EUR * 100) / 100,
      totalOffers: totalOffers ?? 0,
      publicOffers: publicOffers ?? 0,
      assignmentsTotal: assignmentsTotal ?? 0,
      assignmentsLast7Days: assignmentsLast7Days ?? 0,
      applicationsTotal: applicationsTotal ?? 0,
      auditsPending: auditsPending ?? 0,
      billingActiveTotal: billingActiveTotal ?? 0,
    },
    topTargetJobs,
    topStudyDomains,
    topRegions,
    contractTypes,
    topAcquisitionSources,
    topSearchLevels,
    topApplicationsSentRanges,
    topPreferredSectors,
    topAlternanceRhythms,
    candidates,
  };
}
