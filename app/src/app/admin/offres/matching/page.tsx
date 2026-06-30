import { AdminOfferMatchingPanel } from "@/components/admin/admin-offer-matching-panel";
import { getAdminEmail } from "@/lib/admin-auth";
import { loadAdminOffersTotals } from "@/lib/admin-offers";

export const dynamic = "force-dynamic";

export default async function AdminOfferMatchingPage() {
  let totalOffers: number | undefined;

  try {
    const totals = await loadAdminOffersTotals();
    totalOffers = totals.total;
  } catch {
    totalOffers = undefined;
  }

  return (
    <section className="admin-offer-page">
      <header className="admin-offer-header">
        <span className="brand-chip">ADMIN OFFRES</span>
        <h1>Matching</h1>
        <p className="muted">
          Réservé à <strong>{getAdminEmail()}</strong>. Lance l&apos;association offres ↔ profils
          candidats quand tu le souhaites.
        </p>
      </header>
      <AdminOfferMatchingPanel recentOfferCount={totalOffers} />
    </section>
  );
}
