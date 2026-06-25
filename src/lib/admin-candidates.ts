import { getAdminEmail, getAdminUserId } from "@/lib/admin-auth";
import type { AdminCandidateProfile } from "@/lib/admin-stats";
import { mapCandidate } from "@/lib/admin-candidate-map";
import { createAdminClient } from "@/lib/supabase/admin";
import { USER_ACTIVITY_EVENT_LABELS } from "@/lib/user-activity";

export type CandidateKanbanStage = "new" | "profile_ready" | "exploring" | "applying";

export type AdminCandidateCard = AdminCandidateProfile & {
  stage: CandidateKanbanStage;
  applicationsCount: number;
  interestsCount: number;
  offerClicksCount: number;
  assignmentsCount: number;
  lastActivityAt: string | null;
};

export type AdminCandidateDocument = {
  id: string;
  documentType: "cv" | "cover_letter";
  fileName: string;
  uploadedAt: string;
  signedUrl: string | null;
};

export type AdminCandidateApplication = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  url: string | null;
  status: string;
  appliedAt: string;
  createdAt: string;
};

export type AdminCandidateInterest = {
  offerId: string;
  createdAt: string;
  title: string;
  company: string | null;
  location: string | null;
};

export type AdminCandidateAssignment = {
  id: string;
  status: string;
  assignedAt: string;
  title: string;
  company: string | null;
  location: string | null;
};

export type AdminCandidateActivity = {
  id: string;
  eventType: string;
  label: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type AdminCandidateDetail = AdminCandidateCard & {
  interestKeywords: string[];
  documents: AdminCandidateDocument[];
  applications: AdminCandidateApplication[];
  interests: AdminCandidateInterest[];
  assignments: AdminCandidateAssignment[];
  recentActivity: AdminCandidateActivity[];
  activitySummary: Record<string, number>;
};

const KANBAN_STAGES: { id: CandidateKanbanStage; title: string; hint: string }[] = [
  { id: "new", title: "Nouveaux", hint: "Inscription — profil incomplet" },
  { id: "profile_ready", title: "Profil prêt", hint: "Onboarding terminé, pas encore actif" },
  { id: "exploring", title: "Explore les offres", hint: "Intérêts, clics ou offres reçues" },
  { id: "applying", title: "En candidature", hint: "Au moins une candidature suivie" },
];

export function getKanbanStageDefinitions() {
  return KANBAN_STAGES;
}

function profileFilter<T>(query: T): T {
  const supabase = query as unknown as {
    neq: (column: string, value: string) => T;
  };
  let filtered = supabase.neq("email", getAdminEmail());
  const adminUserId = getAdminUserId();
  if (adminUserId) {
    filtered = (filtered as unknown as { neq: (column: string, value: string) => T }).neq(
      "id",
      adminUserId,
    );
  }
  return filtered;
}

function resolveStage(input: {
  onboardingCompleted: boolean;
  applicationsCount: number;
  interestsCount: number;
  offerClicksCount: number;
  assignmentsCount: number;
}): CandidateKanbanStage {
  if (!input.onboardingCompleted) return "new";
  if (input.applicationsCount > 0) return "applying";
  if (input.interestsCount > 0 || input.offerClicksCount > 0 || input.assignmentsCount > 0) {
    return "exploring";
  }
  return "profile_ready";
}

function countByUser(rows: { user_id: string }[]) {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.user_id, (map.get(row.user_id) ?? 0) + 1);
  }
  return map;
}

function countClicksByUser(
  rows: { user_id: string; event_type: string }[],
) {
  const map = new Map<string, number>();
  const clickTypes = new Set(["offer_open_external", "offer_view_modal", "offer_apply_click"]);
  for (const row of rows) {
    if (!clickTypes.has(row.event_type)) continue;
    map.set(row.user_id, (map.get(row.user_id) ?? 0) + 1);
  }
  return map;
}

function lastActivityByUser(rows: { user_id: string; created_at: string }[]) {
  const map = new Map<string, string>();
  for (const row of rows) {
    const prev = map.get(row.user_id);
    if (!prev || row.created_at > prev) {
      map.set(row.user_id, row.created_at);
    }
  }
  return map;
}

const profileSelect =
  "id, email, full_name, phone, school_name, study_level, study_domain, target_job, regions, start_date, contract_type, contract_duration, alternance_rhythm, alternance_rhythm_other, preferred_sectors, acquisition_source, acquisition_source_other, applications_sent_range, search_level, onboarding_completed, subscription_status, created_at, updated_at";

export async function loadAdminCandidatesKanban(): Promise<{
  candidates: AdminCandidateCard[];
  total: number;
}> {
  const supabase = createAdminClient();

  const [
    { data: profileRows },
    { data: applicationRows },
    { data: interestRows },
    { data: assignmentRows },
    activityRes,
  ] = await Promise.all([
    profileFilter(
      supabase.from("profiles").select(profileSelect).order("created_at", { ascending: false }),
    ),
    supabase.from("applications").select("user_id"),
    supabase.from("offer_interests").select("user_id"),
    supabase.from("offer_assignments").select("user_id"),
    supabase
      .from("user_activity_events")
      .select("user_id, event_type, created_at")
      .order("created_at", { ascending: false })
      .limit(5000),
  ]);

  const activityRows = activityRes.error ? [] : activityRes.data ?? [];

  const applicationsByUser = countByUser((applicationRows ?? []) as { user_id: string }[]);
  const interestsByUser = countByUser((interestRows ?? []) as { user_id: string }[]);
  const assignmentsByUser = countByUser((assignmentRows ?? []) as { user_id: string }[]);
  const clicksByUser = countClicksByUser(
    (activityRows ?? []) as { user_id: string; event_type: string }[],
  );
  const lastActivity = lastActivityByUser(
    (activityRows ?? []) as { user_id: string; created_at: string }[],
  );

  const candidates: AdminCandidateCard[] = (profileRows ?? []).map((row) => {
    const profile = mapCandidate(row as Record<string, unknown>);
    const applicationsCount = applicationsByUser.get(profile.id) ?? 0;
    const interestsCount = interestsByUser.get(profile.id) ?? 0;
    const assignmentsCount = assignmentsByUser.get(profile.id) ?? 0;
    const offerClicksCount = clicksByUser.get(profile.id) ?? 0;

    return {
      ...profile,
      applicationsCount,
      interestsCount,
      offerClicksCount,
      assignmentsCount,
      lastActivityAt: lastActivity.get(profile.id) ?? profile.updatedAt,
      stage: resolveStage({
        onboardingCompleted: profile.onboardingCompleted,
        applicationsCount,
        interestsCount,
        offerClicksCount,
        assignmentsCount,
      }),
    };
  });

  return { candidates, total: candidates.length };
}

export async function loadAdminCandidateDetail(
  userId: string,
): Promise<AdminCandidateDetail | null> {
  const supabase = createAdminClient();

  const { data: profileRow } = await profileFilter(
    supabase.from("profiles").select(profileSelect).eq("id", userId).maybeSingle(),
  );

  if (!profileRow) return null;

  const profile = mapCandidate(profileRow as Record<string, unknown>);

  const [
    { data: applications },
    { data: interests },
    { data: assignments },
    { data: documents },
    { data: preferences },
    activityRes,
    { count: applicationsCount },
    { count: interestsCount },
    { count: assignmentsCount },
  ] = await Promise.all([
    supabase
      .from("applications")
      .select("id, title, company, location, url, status, applied_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("offer_interests")
      .select("offer_id, created_at, offers (title, company, location)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("offer_assignments")
      .select("id, status, assigned_at, offers (title, company, location)")
      .eq("user_id", userId)
      .order("assigned_at", { ascending: false }),
    supabase
      .from("user_documents")
      .select("id, document_type, file_name, file_path, uploaded_at")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("uploaded_at", { ascending: false }),
    supabase
      .from("user_preferences")
      .select("interest_keywords")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("user_activity_events")
      .select("id, event_type, payload, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(80),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("offer_interests").select("offer_id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("offer_assignments").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ]);

  const activity = activityRes.error ? [] : activityRes.data ?? [];

  const signedDocuments: AdminCandidateDocument[] = await Promise.all(
    (documents ?? []).map(async (doc) => {
      const { data, error } = await supabase.storage
        .from("user-documents")
        .createSignedUrl(doc.file_path as string, 60 * 60);
      return {
        id: doc.id as string,
        documentType: doc.document_type as "cv" | "cover_letter",
        fileName: doc.file_name as string,
        uploadedAt: doc.uploaded_at as string,
        signedUrl: error ? null : data.signedUrl,
      };
    }),
  );

  type OfferEmbed = { title: string; company: string | null; location: string | null } | null;

  function offerFromRowEmbed(raw: unknown): OfferEmbed {
    if (Array.isArray(raw)) return (raw[0] as OfferEmbed) ?? null;
    if (raw && typeof raw === "object") return raw as OfferEmbed;
    return null;
  }

  const interestList: AdminCandidateInterest[] = (interests ?? []).map((row) => {
    const offer = offerFromRowEmbed(row.offers);
    return {
      offerId: row.offer_id as string,
      createdAt: row.created_at as string,
      title: offer?.title ?? "Offre",
      company: offer?.company ?? null,
      location: offer?.location ?? null,
    };
  });

  const assignmentList: AdminCandidateAssignment[] = (assignments ?? []).map((row) => {
    const offer = offerFromRowEmbed(row.offers);
    return {
      id: row.id as string,
      status: row.status as string,
      assignedAt: row.assigned_at as string,
      title: offer?.title ?? "Offre",
      company: offer?.company ?? null,
      location: offer?.location ?? null,
    };
  });

  const activitySummary: Record<string, number> = {};
  for (const row of activity ?? []) {
    const type = row.event_type as string;
    activitySummary[type] = (activitySummary[type] ?? 0) + 1;
  }

  const offerClicksCount =
    (activitySummary.offer_open_external ?? 0) +
    (activitySummary.offer_view_modal ?? 0) +
    (activitySummary.offer_apply_click ?? 0);

  const applicationList: AdminCandidateApplication[] = (applications ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    company: (row.company as string | null) ?? null,
    location: (row.location as string | null) ?? null,
    url: (row.url as string | null) ?? null,
    status: row.status as string,
    appliedAt: row.applied_at as string,
    createdAt: row.created_at as string,
  }));

  const recentActivity: AdminCandidateActivity[] = (activity ?? []).map((row) => ({
    id: row.id as string,
    eventType: row.event_type as string,
    label: USER_ACTIVITY_EVENT_LABELS[row.event_type as string] ?? (row.event_type as string),
    payload: (row.payload as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
  }));

  return {
    ...profile,
    applicationsCount: applicationsCount ?? 0,
    interestsCount: interestsCount ?? 0,
    assignmentsCount: assignmentsCount ?? 0,
    offerClicksCount,
    lastActivityAt: recentActivity[0]?.createdAt ?? profile.updatedAt,
    stage: resolveStage({
      onboardingCompleted: profile.onboardingCompleted,
      applicationsCount: applicationsCount ?? 0,
      interestsCount: interestsCount ?? 0,
      offerClicksCount,
      assignmentsCount: assignmentsCount ?? 0,
    }),
    interestKeywords: (preferences?.interest_keywords as string[] | null) ?? [],
    documents: signedDocuments,
    applications: applicationList,
    interests: interestList,
    assignments: assignmentList,
    recentActivity,
    activitySummary,
  };
}
