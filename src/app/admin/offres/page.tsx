import { AdminOfferCsvImport } from "@/components/admin/admin-offer-csv-import";
import { AdminOfferForm } from "@/components/admin/admin-offer-form";
import { AdminOffersList } from "@/components/admin/admin-offers-list";
import { getAdminEmail } from "@/lib/admin-auth";
import { loadAdminOffersList } from "@/lib/admin-offers";

export const dynamic = "force-dynamic";

export default async function AdminOffersPage() {
  let offers: Awaited<ReturnType<typeof loadAdminOffersList>> = [];
  let listError: string | null = null;

  try {
    offers = await loadAdminOffersList(100);
  } catch (cause) {
    listError =
      cause instanceof Error ? cause.message : "Impossible de charger la liste des offres.";
  }

  return (
    <section className="admin-offer-page">
      <header className="admin-offer-header">
        <span className="brand-chip">ADMIN OFFRES</span>
        <h1>Gérer les offres</h1>
        <p className="muted">
          Reserve a <strong>{getAdminEmail()}</strong>. Importe en masse les offres publiques (CSV),
          publie une offre partenaire ou modifie une offre existante.
        </p>
      </header>
      <div className="admin-offer-panel">
        {listError ? (
          <p className="error admin-offer-error" role="alert">
            {listError}
          </p>
        ) : (
          <AdminOffersList offers={offers} />
        )}
        <AdminOfferCsvImport />
        <AdminOfferForm />
      </div>
    </section>
  );
}
