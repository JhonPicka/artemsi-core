import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { ActivityPageTracker } from "@/components/activity/activity-page-tracker";
import { requireUser } from "@/lib/auth";
import {
  buildActivationSteps,
  buildApplicationsMomentum,
  buildAssignmentDailySeries,
  buildTodayActions,
  buildApplicationMonthSeries,
  getCurrentMonthLabelParis,
  countApplicationsInLastNDays,
  countAssignmentsInLastNDays,
  countByApplicationStatus,
  countByOfferAssignmentStatus,
  countStaleSentApplications,
} from "@/lib/dashboard-stats";
import { USER_ACTIVITY_EVENTS } from "@/lib/user-activity";
import { createClient } from "@/lib/supabase/server";

function getFirstName(fullName: string | null | undefined) {
  if (!fullName) return null;
  const trimmed = fullName.trim();
  if (!trimmed) return null;
  return trimmed.split(/\s+/)[0] ?? null;
}

function formatNextAudit(
  row: { slot_start: string; status: string } | null | undefined,
): { label: string; detail: string } | null {
  if (!row) return null;
  const start = new Date(row.slot_start);
  const isPending = row.status === "pending";
  const day = start.toLocaleDateString("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const time = start.toLocaleTimeString("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
  });
  return {
    label: isPending ? "En attente de confirmation" : "Confirmé",
    detail: `Prochain audit : ${day} à ${time} (${isPending ? "en attente" : "confirmé"}).`,
  };
}

function buildHeroSubtitle(input: {
  offersToRead: number;
  upcomingAuditsCount: number;
  applicationsCount: number;
}): string {
  if (input.offersToRead > 0) {
    return input.offersToRead === 1
      ? "Tu as 1 nouvelle offre ciblée à découvrir aujourd'hui."
      : `Tu as ${input.offersToRead} nouvelles offres ciblées à découvrir aujourd'hui.`;
  }
  if (input.upcomingAuditsCount > 0) {
    return "Audit à venir : prépare tes questions et ton CV à jour.";
  }
  if (input.applicationsCount === 0) {
    return "Lance ta première candidature aujourd'hui — on t'accompagne pas à pas.";
  }
  return "Garde le rythme : 2 actions par jour suffisent à transformer une recherche en alternance.";
}

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [
    { data: profile },
    { count: documentsCount },
    { data: offerAssignments },
    { data: applicationRows },
    { count: publicOffersCount },
    { data: nextAudits },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, onboarding_completed")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("user_documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_active", true),
    supabase
      .from("offer_assignments")
      .select("assigned_at, status")
      .eq("user_id", user.id)
      .order("assigned_at", { ascending: false }),
    supabase
      .from("applications")
      .select("status, applied_at, updated_at")
      .eq("user_id", user.id),
    supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .eq("is_public", true),
    supabase
      .from("audit_bookings")
      .select("slot_start, status")
      .eq("user_id", user.id)
      .in("status", ["pending", "confirmed"])
      .gte("slot_start", new Date().toISOString())
      .order("slot_start", { ascending: true })
      .limit(1),
  ]);

  const firstName = getFirstName(profile?.full_name);
  const assignments = offerAssignments ?? [];
  const apps = applicationRows ?? [];

  const oa = countByOfferAssignmentStatus(assignments);
  const ac = countByApplicationStatus(apps);
  const totalApps = apps.length;
  const activeCands = totalApps - ac.archived;
  const applicationHot = countApplicationsInLastNDays(apps, 7);
  const assignmentsHotWeek = countAssignmentsInLastNDays(assignments, 7);
  const assignmentSeries = buildAssignmentDailySeries(assignments, 14);
  const applicationMonthSeries = buildApplicationMonthSeries(
    apps.map((row) => ({
      applied_at: row.applied_at,
      status: row.status,
      updated_at: row.updated_at,
    })),
  );
  const applicationChartMonthLabel = getCurrentMonthLabelParis();
  const nextA = nextAudits?.[0] ? formatNextAudit(nextAudits[0]) : null;
  const upcomingAuditsCount = (nextAudits ?? []).length;

  const momentum = buildApplicationsMomentum(apps);
  const staleApplicationsCount = countStaleSentApplications(apps, 10);

  const activation = buildActivationSteps({
    onboardingCompleted: Boolean(profile?.onboarding_completed),
    documentsCount: documentsCount ?? 0,
    applicationsCount: totalApps,
    upcomingAuditsCount,
  });

  const todayActions = buildTodayActions({
    offersToRead: oa.sent,
    applicationsCount: totalApps,
    upcomingAuditsCount,
    documentsCount: documentsCount ?? 0,
    staleApplicationsCount,
  });

  const heroSubtitle = buildHeroSubtitle({
    offersToRead: oa.sent,
    upcomingAuditsCount,
    applicationsCount: totalApps,
  });

  const kpi = [
    {
      label: "Offres ciblées",
      value: String(assignments.length),
      hint: oa.sent > 0 ? `${oa.sent} à consulter` : "À jour",
      tone: "accent" as const,
    },
    {
      label: "Offres reçues",
      value: String(assignmentsHotWeek),
      hint:
        assignmentsHotWeek > 0
          ? `Cette semaine · ${assignments.length} au total`
          : "Aucune cette semaine",
    },
    {
      label: "Candidatures actives",
      value: String(Math.max(0, activeCands)),
      hint: `${applicationHot} ajoutée${applicationHot > 1 ? "s" : ""} sur 7 jours`,
    },
    {
      label: "Entretiens",
      value: String(ac.interview),
      hint: ac.interview > 0 ? "Garde la cadence !" : "Aucun entretien en cours",
      tone: "success" as const,
    },
    {
      label: "Prochain audit",
      value: nextA?.label ?? "—",
      hint: nextA ? "Voir le détail dans l'onglet Audit" : "À planifier cette semaine",
      tone: nextA ? ("warning" as const) : ("default" as const),
    },
  ];

  const pipeline = [
    { label: "Envoyée", value: ac.sent, variant: "status-sent" },
    { label: "Entretien", value: ac.interview, variant: "status-interview" },
    { label: "Acceptée", value: ac.accepted, variant: "status-accepted" },
    { label: "Refusée", value: ac.rejected, variant: "status-rejected" },
    { label: "Archivée", value: ac.archived, variant: "status-archived" },
  ];

  return (
    <>
      <ActivityPageTracker eventType={USER_ACTIVITY_EVENTS.DASHBOARD_VIEW} />
      <DashboardOverview
      firstName={firstName}
      heroSubtitle={heroSubtitle}
      documentsCount={documentsCount ?? 0}
      publicOffersCount={publicOffersCount ?? 0}
      kpi={kpi}
      assignmentSeries={assignmentSeries}
      applicationChartSeries={applicationMonthSeries}
      applicationChartMonthLabel={applicationChartMonthLabel}
      pipeline={pipeline}
      applicationHotWeek={applicationHot}
      momentum={momentum}
      activation={activation}
      todayActions={todayActions}
      nextAuditLabel={nextA?.label ?? null}
      nextAuditDetail={nextA?.detail ?? null}
    />
    </>
  );
}
