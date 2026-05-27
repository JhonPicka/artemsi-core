import { AdminOfferForm } from "@/components/admin/admin-offer-form";
import { getAdminEmail } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default function AdminOffersPage() {
  return (
    <section className="admin-offer-page">
      <header className="admin-offer-header">
        <span className="brand-chip">ADMIN OFFRES</span>
        <h1>Ajouter une offre</h1>
        <p className="muted">
          Reserve a <strong>{getAdminEmail()}</strong>. Analyse l&apos;URL, verifie les champs,
          publie dans ARTEMSI et declenche le matching automatique.
        </p>
      </header>
      <AdminOfferForm />
    </section>
  );
}
