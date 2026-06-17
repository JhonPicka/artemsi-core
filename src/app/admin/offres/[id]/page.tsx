import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminOfferEditForm } from "@/components/admin/admin-offer-edit-form";
import { loadAdminOfferById } from "@/lib/admin-offers";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminOfferEditPage({ params }: Props) {
  const { id } = await params;

  let offer: Awaited<ReturnType<typeof loadAdminOfferById>> = null;
  let error: string | null = null;

  try {
    offer = await loadAdminOfferById(id);
  } catch (cause) {
    error =
      cause instanceof Error
        ? cause.message
        : "Impossible de charger l'offre (SUPABASE_SERVICE_ROLE_KEY ?).";
  }

  if (error) {
    return (
      <section className="admin-offer-page">
        <header className="admin-offer-header">
          <span className="brand-chip">ADMIN OFFRES</span>
          <h1>Modifier une offre</h1>
          <p className="error" role="alert">
            {error}
          </p>
        </header>
      </section>
    );
  }

  if (!offer) {
    notFound();
  }

  return (
    <section className="admin-offer-page">
      <header className="admin-offer-header">
        <span className="brand-chip">ADMIN OFFRES</span>
        <h1>Modifier l&apos;offre</h1>
        <p className="muted">
          <Link href="/admin/offres" className="admin-inline-link">
            ← Retour aux offres
          </Link>
        </p>
      </header>
      <AdminOfferEditForm offer={offer} />
    </section>
  );
}
