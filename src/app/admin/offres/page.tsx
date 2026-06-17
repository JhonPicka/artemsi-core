import { AdminOfferCsvImport } from "@/components/admin/admin-offer-csv-import";
import { AdminOfferForm } from "@/components/admin/admin-offer-form";
import { getAdminEmail } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default function AdminOffersPage() {
  return (
    <section className="admin-offer-page">
      <header className="admin-offer-header">
        <span className="brand-chip">ADMIN OFFRES</span>
        <h1>Gérer les offres</h1>
        <p className="muted">
          Reserve a <strong>{getAdminEmail()}</strong>. Importe en masse les offres publiques (CSV)
          ou publie une offre partenaire / exclusive via le formulaire avec analyse IA.
        </p>
      </header>
      <div className="admin-offer-panel">
        <AdminOfferCsvImport />
        <AdminOfferForm />
      </div>
    </section>
  );
}
