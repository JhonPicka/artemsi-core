import { AdminStatsView } from "@/components/admin/admin-stats-view";
import { loadAdminDashboardStats } from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

export default async function AdminStatsPage() {
  let stats;
  let error: string | null = null;

  try {
    stats = await loadAdminDashboardStats();
  } catch (cause) {
    error =
      cause instanceof Error
        ? cause.message
        : "Impossible de charger les statistiques (SUPABASE_SERVICE_ROLE_KEY ?).";
    stats = null;
  }

  if (error || !stats) {
    return (
      <section className="admin-offer-page">
        <header className="admin-offer-header">
          <span className="brand-chip">STATISTIQUES</span>
          <h1>Pilotage détaillé</h1>
          <p className="error" role="alert">
            {error}
          </p>
        </header>
      </section>
    );
  }

  return (
    <section className="admin-offer-page">
      <AdminStatsView stats={stats} />
    </section>
  );
}
