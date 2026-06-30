import { AdminLbaDailyDecision } from "@/components/admin/admin-lba-daily-decision";
import { AdminOfferCsvImport } from "@/components/admin/admin-offer-csv-import";
import { AdminOfferLbaImport } from "@/components/admin/admin-offer-lba-import";
import { getAdminEmail } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default function AdminOfferImportPage() {
  return (
    <section className="admin-offer-page">
      <header className="admin-offer-header">
        <span className="brand-chip">ADMIN OFFRES</span>
        <h1>Import offres</h1>
        <p className="muted">
          Réservé à <strong>{getAdminEmail()}</strong>. Import LBA (API) ou CSV en masse. Le
          matching peut être lancé juste après.
        </p>
      </header>
      <AdminLbaDailyDecision />
      <AdminOfferLbaImport />
      <AdminOfferCsvImport />
    </section>
  );
}
