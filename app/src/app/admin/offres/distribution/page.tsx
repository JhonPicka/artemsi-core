import { AdminOfferDistributionView } from "@/components/admin/admin-offer-distribution-view";
import { getAdminEmail } from "@/lib/admin-auth";
import { loadOfferDistributionStats } from "@/lib/admin-offer-distribution";

export const dynamic = "force-dynamic";

export default async function AdminOfferDistributionPage() {
  let stats: Awaited<ReturnType<typeof loadOfferDistributionStats>> | null = null;
  let error: string | null = null;

  try {
    stats = await loadOfferDistributionStats();
  } catch (cause) {
    error =
      cause instanceof Error ? cause.message : "Impossible de charger la distribution.";
  }

  return (
    <section className="admin-offer-page">
      <header className="admin-offer-header">
        <span className="brand-chip">ADMIN OFFRES</span>
        <h1>Distribution</h1>
        <p className="muted">
          Réservé à <strong>{getAdminEmail()}</strong>. Compare profils et offres par domaine pour
          savoir quoi publier chaque jour.
        </p>
      </header>
      {error ? (
        <p className="error admin-offer-error" role="alert">
          {error}
        </p>
      ) : stats ? (
        <AdminOfferDistributionView stats={stats} />
      ) : null}
    </section>
  );
}
