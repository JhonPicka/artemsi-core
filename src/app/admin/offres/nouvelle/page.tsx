import { AdminOfferForm } from "@/components/admin/admin-offer-form";
import { getAdminEmail } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default function AdminOfferNewPage() {
  return (
    <section className="admin-offer-page">
      <header className="admin-offer-header">
        <span className="brand-chip">ADMIN OFFRES</span>
        <h1>Nouvelle offre</h1>
        <p className="muted">
          Réservé à <strong>{getAdminEmail()}</strong>. Analyse une URL ou saisis les infos à la
          main, puis publie sans lancer le matching automatiquement.
        </p>
      </header>
      <AdminOfferForm />
    </section>
  );
}
