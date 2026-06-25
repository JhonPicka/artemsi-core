import {
  ApplicationsManager,
  type ApplicationItem,
} from "@/components/applications/applications-manager";
import { ActivityPageTracker } from "@/components/activity/activity-page-tracker";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { USER_ACTIVITY_EVENTS } from "@/lib/user-activity";

export default async function DashboardApplicationsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select("id, title, company, location, url, status, applied_at, notes")
    .eq("user_id", user.id)
    .order("applied_at", { ascending: false });

  const applications = (data ?? []) as ApplicationItem[];

  return (
    <>
      <ActivityPageTracker eventType={USER_ACTIVITY_EVENTS.APPLICATIONS_VIEW} />
      {error ? (
        <section className="card">
          <p className="error">Erreur chargement candidatures: {error.message}</p>
        </section>
      ) : (
        <section className="card">
          <ApplicationsManager initialApplications={applications} />
        </section>
      )}
    </>
  );
}
