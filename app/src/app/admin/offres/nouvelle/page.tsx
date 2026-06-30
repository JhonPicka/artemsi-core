import { AdminOfferForm } from "@/components/admin/admin-offer-form";
import { getAdminEmail } from "@/lib/admin-auth";
import { normalizeStudyDomain } from "@/lib/study-domain";
import type { StudyDomain } from "@/lib/constants";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminOfferNewPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const initialStudyDomain = normalizeStudyDomain(firstParam(raw.domain)) ?? undefined;

  return (
    <section className="admin-offer-page">
      <header className="admin-offer-header">
        <span className="brand-chip">ADMIN OFFRES</span>
        <h1>Nouvelle offre</h1>
        <p className="muted">
          Réservé à <strong>{getAdminEmail()}</strong>. Analyse une URL ou saisis les infos à la
          main, puis publie sans lancer le matching automatiquement.
          {initialStudyDomain ? (
            <>
              {" "}
              Domaine pré-sélectionné depuis la distribution.
            </>
          ) : null}
        </p>
      </header>
      <AdminOfferForm initialStudyDomain={initialStudyDomain as StudyDomain | undefined} />
    </section>
  );
}
