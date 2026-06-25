import { AdminOfferCsvImport } from "@/components/admin/admin-offer-csv-import";
import { getAdminEmail } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default function AdminOfferImportPage() {
  return (
    <section className="admin-offer-page">
      <header className="admin-offer-header">
        <span className="brand-chip">ADMIN OFFRES</span>
        <h1>Import CSV</h1>
        <p className="muted">
          Réservé à <strong>{getAdminEmail()}</strong>. Import en masse des offres publiques (non
          partenaires). Le matching reste manuel.
        </p>
      </header>
      <AdminOfferCsvImport />
    </section>
  );
}
