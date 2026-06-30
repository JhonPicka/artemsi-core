import {
  getKanbanStageDefinitions,
  loadAdminCandidatesKanban,
} from "@/lib/admin-candidates";
import { AdminCandidatesKanban } from "@/components/admin/admin-candidates-kanban";

export const dynamic = "force-dynamic";

export default async function AdminCandidatesPage() {
  let error: string | null = null;
  let data: Awaited<ReturnType<typeof loadAdminCandidatesKanban>> | null = null;

  try {
    data = await loadAdminCandidatesKanban();
  } catch (cause) {
    error =
      cause instanceof Error
        ? cause.message
        : "Impossible de charger les candidats. Migration user_activity_events appliquée ?";
  }

  return (
    <section className="admin-candidates-shell">
      <header className="admin-candidate-page-header card">
        <span className="brand-chip">CANDIDATS</span>
        <h1>Suivi candidats</h1>
        <p className="muted admin-candidate-page-lead">
          Kanban par avancement sur la plateforme. Clique sur un candidat pour voir son profil,
          ses documents et son activité.
        </p>
      </header>

      {error ? (
        <p className="error card" role="alert">
          {error}
        </p>
      ) : data ? (
        <AdminCandidatesKanban candidates={data.candidates} stages={getKanbanStageDefinitions()} />
      ) : null}
    </section>
  );
}
