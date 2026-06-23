import { getAdminEmail, getAdminUserId } from "@/lib/admin-auth";
import { BILLING_MONTHLY_PRICE_EUR } from "@/lib/billing-offer";
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
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";

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
    accountTiers: ChartSlice[];
    subscriptions: ChartSlice[];
    acquisitionSources: ChartSlice[];
    searchLevels: ChartSlice[];
    signupsTrend: RankedItem[];
    proActivationsTrend: RankedItem[];
  };
  funnel: {
    signups: number;
    onboardingCompleted: number;
    engagedUsers: number;
    proActive: number;
  };
  kpis: {
    totalAccounts: number;
    freeAccounts: number;
    onboardingCompleted: number;
    onboardingPending: number;
    activeSubscriptions: number;
    canceledSubscriptions: number;
    pastDueSubscriptions: number;
    conversionRatePct: number;
    activationRatePct: number;
    engagementRatePct: number;
    churnRatePct: number;
    paidNotActivated: number;
    signupsLast7Days: number;
    signupsLast30Days: number;
    cancellationsLast30Days: number;
    accountDeletionsLast30Days: number;
    mrrEstimateEur: number;
    totalOffers: number;
    publicOffers: number;
    hiddenOffers: number;
    linkReportsTotal: number;
    assignmentsTotal: number;
    assignmentsLast7Days: number;
    applicationsTotal: number;
    usersWithApplications: number;
    userAddedOffersTotal: number;
    userAddedOffersDailyAverage: number;
    auditsPending: number;
    billingActiveTotal: number;
    billingCustomersTotal: number;
    stripeRefundsCount: number | null;
    stripeRefundRatePct: number | null;
  };
  topTargetJobs: RankedItem[];
  topRegions: RankedItem[];
  topAcquisitionSources: RankedItem[];
  topSearchLevels: RankedItem[];
  candidates: AdminCandidateProfile[];
};

const MONTHLY_PRICE_EUR = BILLING_MONTHLY_PRICE_EUR;

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

function pct(value: number, max: number) {
  if (max <= 0) return 0;
  return Math.round((value / max) * 1000) / 10;
}

function groupCountByRecentDays(
  rows: readonly { created_at?: string; updated_at?: string }[],
  days: number,
): RankedItem[] {
  const map = new Map<string, number>();

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    map.set(d.toISOString().slice(0, 10), 0);
  }

  for (const row of rows) {
    const iso = row.created_at ?? row.updated_at;
    if (!iso) continue;
    const key = iso.slice(0, 10);
    if (map.has(key)) {
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }

  return [...map.entries()].map(([iso, count]) => ({
    label: new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    count,
  }));
}

async function fetchStripeRefundMetrics(): Promise<{
  refundsCount: number;
  refundRatePct: number;
} | null> {
  if (!isStripeConfigured()) return null;

  try {
    const stripe = getStripeClient();
    const since = Math.floor((Date.now() - 90 * 86_400_000) / 1000);
    let refundsCount = 0;
    let paidChargesCount = 0;

    for await (const refund of stripe.refunds.list({
      limit: 100,
      created: { gte: since },
    })) {
      if (!refund.status || refund.status === "succeeded" || refund.status === "pending") {
        refundsCount += 1;
      }
    }

    for await (const charge of stripe.charges.list({
      limit: 100,
      created: { gte: since },
    })) {
      if (charge.paid && !charge.refunded) {
        paidChargesCount += 1;
      }
    }

    const denominator = Math.max(paidChargesCount + refundsCount, 1);
    return {
      refundsCount,
      refundRatePct: pct(refundsCount, denominator),
    };
  } catch {
    return null;
  }
}

function computeDailyAverage(total: number, firstCreatedAt: string | null | undefined) {
  if (!total || !firstCreatedAt) return 0;
  const first = new Date(firstCreatedAt);
  if (Number.isNaN(first.getTime())) return 0;
  const days = Math.max(
    1,
    Math.ceil((Date.now() - first.getTime()) / 86_400_000),
  );
  return Math.round((total / days) * 10) / 10;
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
  const since30d = daysAgoIso(30);
  const since14d = daysAgoIso(14);

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
    { count: freeAccountsCount },
    { count: canceledSubscriptions },
    { count: pastDueSubscriptions },
    { count: signupsLast7Days },
    { count: signupsLast30Days },
    { data: profileRows },
    { data: signupTrendRows },
    { data: proTrendRows },
    { count: totalOffers },
    { count: publicOffers },
    { count: hiddenOffers },
    { count: linkReportsTotal },
    { count: assignmentsTotal },
    { count: assignmentsLast7Days },
    { count: applicationsTotal },
    { data: applicationUserRows },
    { data: firstUserOfferRow },
    { count: auditsPending },
    { data: candidateRows },
    { count: billingActiveTotal },
    { count: billingCustomersTotal },
    { count: cancellationsLast30Days },
    { count: accountDeletionsLast30Days },
    stripeRefundMetrics,
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
        .eq("subscription_status", "inactive"),
    ),
    profileFilter(
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("subscription_status", "canceled"),
    ),
    profileFilter(
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("subscription_status", "past_due"),
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
        .select("id", { count: "exact", head: true })
        .gte("created_at", since30d),
    ),
    profileFilter(
      supabase
        .from("profiles")
        .select(
          "target_job, regions, acquisition_source, search_level, email, subscription_status, onboarding_completed",
        ),
    ),
    profileFilter(
      supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", since14d),
    ),
    profileFilter(
      supabase
        .from("profiles")
        .select("updated_at")
        .eq("subscription_status", "active")
        .gte("updated_at", since14d),
    ),
    supabase.from("offers").select("id", { count: "exact", head: true }),
    supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .eq("is_public", true),
    supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .not("hidden_at", "is", null),
    supabase.from("offer_link_reports").select("id", { count: "exact", head: true }),
    supabase.from("offer_assignments").select("id", { count: "exact", head: true }),
    supabase
      .from("offer_assignments")
      .select("id", { count: "exact", head: true })
      .gte("assigned_at", since7d),
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("user_id"),
    supabase
      .from("applications")
      .select("created_at")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
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
    supabase.from("billing_customers").select("email", { count: "exact", head: true }),
    supabase
      .from("billing_customers")
      .select("email", { count: "exact", head: true })
      .eq("subscription_status", "canceled")
      .gte("updated_at", since30d),
    supabase
      .from("account_deletion_feedback")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since30d),
    fetchStripeRefundMetrics(),
  ]);

  const profiles = profileRows ?? [];
  const total = totalAccounts ?? 0;
  const activeCount = activeSubscriptions ?? 0;
  const canceledCount = canceledSubscriptions ?? 0;
  const pastDueCount = pastDueSubscriptions ?? 0;
  const onboardedCount = onboardingCompleted ?? 0;
  const freeAccounts = freeAccountsCount ?? Math.max(0, total - activeCount - canceledCount - pastDueCount);

  let paidNotActivated = 0;
  const subscriptionCounts = { active: 0, inactive: 0, past_due: 0, canceled: 0 };

  for (const p of profiles) {
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

  const usersWithApplications = new Set(
    (applicationUserRows ?? []).map((row) => row.user_id as string),
  ).size;

  const topTargetJobs = countByField(
    profiles.map((p) => p.target_job as string | null),
    (v) => v.trim(),
  ).slice(0, 8);

  const topRegions = countRegions(profiles.map((p) => p.regions as string[] | null)).slice(0, 8);

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

  const candidates = (candidateRows ?? []).map((row) =>
    mapCandidate(row as Record<string, unknown>),
  );

  const userAddedOffersTotal = applicationsTotal ?? 0;
  const userAddedOffersDailyAverage = computeDailyAverage(
    userAddedOffersTotal,
    firstUserOfferRow?.created_at as string | undefined,
  );

  const churnDenominator = Math.max(activeCount + canceledCount, 1);

  return {
    generatedAt: new Date().toISOString(),
    funnel: {
      signups: total,
      onboardingCompleted: onboardedCount,
      engagedUsers: usersWithApplications,
      proActive: activeCount,
    },
    charts: {
      accountTiers: toSlices([
        { label: "Gratuit", value: freeAccounts },
        { label: "Pro actif", value: activeCount },
        { label: "Résilié", value: canceledCount },
        { label: "Impayé", value: pastDueCount },
      ]),
      subscriptions: toSlices([
        { label: "Actifs", value: subscriptionCounts.active },
        { label: "Gratuits", value: subscriptionCounts.inactive },
        { label: "Impayés", value: subscriptionCounts.past_due },
        { label: "Résiliés", value: subscriptionCounts.canceled },
      ]),
      acquisitionSources: rankedToSlices(topAcquisitionSources),
      searchLevels: rankedToSlices(topSearchLevels),
      signupsTrend: groupCountByRecentDays(signupTrendRows ?? [], 14),
      proActivationsTrend: groupCountByRecentDays(proTrendRows ?? [], 14),
    },
    kpis: {
      totalAccounts: total,
      freeAccounts,
      onboardingCompleted: onboardedCount,
      onboardingPending: Math.max(0, total - onboardedCount),
      activeSubscriptions: activeCount,
      canceledSubscriptions: canceledCount,
      pastDueSubscriptions: pastDueCount,
      conversionRatePct: pct(activeCount, total),
      activationRatePct: pct(onboardedCount, total),
      engagementRatePct: pct(usersWithApplications, Math.max(onboardedCount, 1)),
      churnRatePct: pct(canceledCount, churnDenominator),
      paidNotActivated,
      signupsLast7Days: signupsLast7Days ?? 0,
      signupsLast30Days: signupsLast30Days ?? 0,
      cancellationsLast30Days: cancellationsLast30Days ?? 0,
      accountDeletionsLast30Days: accountDeletionsLast30Days ?? 0,
      mrrEstimateEur: Math.round(activeCount * MONTHLY_PRICE_EUR * 100) / 100,
      totalOffers: totalOffers ?? 0,
      publicOffers: publicOffers ?? 0,
      hiddenOffers: hiddenOffers ?? 0,
      linkReportsTotal: linkReportsTotal ?? 0,
      assignmentsTotal: assignmentsTotal ?? 0,
      assignmentsLast7Days: assignmentsLast7Days ?? 0,
      applicationsTotal: userAddedOffersTotal,
      usersWithApplications,
      userAddedOffersTotal,
      userAddedOffersDailyAverage,
      auditsPending: auditsPending ?? 0,
      billingActiveTotal: billingActiveTotal ?? 0,
      billingCustomersTotal: billingCustomersTotal ?? 0,
      stripeRefundsCount: stripeRefundMetrics?.refundsCount ?? null,
      stripeRefundRatePct: stripeRefundMetrics?.refundRatePct ?? null,
    },
    topTargetJobs,
    topRegions,
    topAcquisitionSources,
    topSearchLevels,
    candidates,
  };
}
