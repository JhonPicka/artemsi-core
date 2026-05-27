import { getAdminEmail } from "@/lib/admin-auth";
import {
  CONTRACT_TYPE_LABEL,
  STUDY_DOMAIN_LABEL,
  type ContractType,
  type StudyDomain,
} from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";

export type RankedItem = { label: string; count: number };

export type RecentSignup = {
  id: string;
  email: string;
  fullName: string | null;
  targetJob: string | null;
  onboardingCompleted: boolean;
  subscriptionStatus: string;
  createdAt: string;
};

export type ChartSlice = { label: string; value: number; color: string };

export type AdminDashboardStats = {
  generatedAt: string;
  charts: {
    profileCompletion: ChartSlice[];
    subscriptions: ChartSlice[];
    contractTypes: ChartSlice[];
    studyDomains: ChartSlice[];
  };
  kpis: {
    totalAccounts: number;
    onboardingCompleted: number;
    activeSubscriptions: number;
    signupsLast7Days: number;
    totalOffers: number;
    publicOffers: number;
    assignmentsTotal: number;
    assignmentsLast7Days: number;
    applicationsTotal: number;
    auditsPending: number;
  };
  topTargetJobs: RankedItem[];
  topStudyDomains: RankedItem[];
  topRegions: RankedItem[];
  contractTypes: RankedItem[];
  recentSignups: RecentSignup[];
};

function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function countByField<T extends string | null | undefined>(
  rows: T[],
  normalize: (v: string) => string = (v) => v.trim().toLowerCase(),
): RankedItem[] {
  const map = new Map<string, number>();
  for (const raw of rows) {
    if (!raw?.trim()) continue;
    const key = normalize(raw);
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

export async function loadAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = createAdminClient();
  const adminEmail = getAdminEmail();
  const since7d = daysAgoIso(7);

  // Helper that adds the admin-email filter on every profiles query.
  // Typed via `unknown` to accept both PostgrestQueryBuilder and the
  // chained PostgrestFilterBuilder (both expose .neq()).
  const profileFilter = <T>(query: T): T => {
    return (query as unknown as { neq: (column: string, value: string) => T }).neq(
      "email",
      adminEmail,
    );
  };

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
    { data: recentRows },
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
          "target_job, study_domain, regions, contract_type, email, subscription_status, onboarding_completed",
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
        .select(
          "id, email, full_name, target_job, onboarding_completed, subscription_status, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(10),
    ),
  ]);

  const profiles = profileRows ?? [];

  let onboardingDone = 0;
  let onboardingPending = 0;
  const subscriptionCounts = { active: 0, inactive: 0, past_due: 0, canceled: 0 };

  for (const p of profiles) {
    if (p.onboarding_completed) onboardingDone += 1;
    else onboardingPending += 1;
    const status = String(p.subscription_status ?? "inactive");
    if (status in subscriptionCounts) {
      subscriptionCounts[status as keyof typeof subscriptionCounts] += 1;
    } else {
      subscriptionCounts.inactive += 1;
    }
  }

  const PIE_COLORS = [
    "var(--admin-chart-1)",
    "var(--admin-chart-2)",
    "var(--admin-chart-3)",
    "var(--admin-chart-4)",
    "var(--admin-chart-5)",
    "var(--admin-chart-6)",
  ];

  function toSlices(
    entries: { label: string; value: number }[],
    max = 6,
  ): ChartSlice[] {
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

  const topRegions = countRegions(
    profiles.map((p) => p.regions as string[] | null),
  ).slice(0, 8);

  const contractTypes = countByField(
    profiles.map((p) => {
      const code = p.contract_type as ContractType | null;
      if (!code) return null;
      return CONTRACT_TYPE_LABEL[code] ?? code;
    }),
  );

  const recentSignups: RecentSignup[] = (recentRows ?? []).map((row) => ({
    id: row.id as string,
    email: row.email as string,
    fullName: row.full_name as string | null,
    targetJob: row.target_job as string | null,
    onboardingCompleted: Boolean(row.onboarding_completed),
    subscriptionStatus: String(row.subscription_status ?? "inactive"),
    createdAt: row.created_at as string,
  }));

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
    },
    kpis: {
      totalAccounts: totalAccounts ?? 0,
      onboardingCompleted: onboardingCompleted ?? 0,
      activeSubscriptions: activeSubscriptions ?? 0,
      signupsLast7Days: signupsLast7Days ?? 0,
      totalOffers: totalOffers ?? 0,
      publicOffers: publicOffers ?? 0,
      assignmentsTotal: assignmentsTotal ?? 0,
      assignmentsLast7Days: assignmentsLast7Days ?? 0,
      applicationsTotal: applicationsTotal ?? 0,
      auditsPending: auditsPending ?? 0,
    },
    topTargetJobs,
    topStudyDomains,
    topRegions,
    contractTypes,
    recentSignups,
  };
}
