import { AdminAuditsPanel } from "@/components/admin/admin-audits-panel";
import { loadAdminAuditBookings, loadAdminAuditHistory } from "@/lib/admin-audit";

export const dynamic = "force-dynamic";

export default async function AdminAuditsPage() {
  let pendingAudits: Awaited<ReturnType<typeof loadAdminAuditBookings>> = [];
  let upcomingAudits: Awaited<ReturnType<typeof loadAdminAuditBookings>> = [];
  let auditHistory: Awaited<ReturnType<typeof loadAdminAuditHistory>> = [];
  let error: string | null = null;

  try {
    [pendingAudits, upcomingAudits, auditHistory] = await Promise.all([
      loadAdminAuditBookings({ pendingOnly: true, limit: 30 }),
      loadAdminAuditBookings({ pendingOnly: false, limit: 8 }),
      loadAdminAuditHistory(80),
    ]);
  } catch (cause) {
    error =
      cause instanceof Error
        ? cause.message
        : "Impossible de charger les audits (SUPABASE_SERVICE_ROLE_KEY ?).";
  }

  if (error) {
    return (
      <section className="admin-offer-page">
        <header className="admin-offer-header">
          <span className="brand-chip">AUDITS</span>
          <h1>Gestion des audits</h1>
          <p className="error" role="alert">
            {error}
          </p>
        </header>
      </section>
    );
  }

  return (
    <section className="admin-offer-page">
      <AdminAuditsPanel
        initialPending={pendingAudits}
        initialUpcoming={upcomingAudits}
        initialHistory={auditHistory}
      />
    </section>
  );
}
