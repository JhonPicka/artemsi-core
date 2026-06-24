import { AdminOfferCsvImport } from "@/components/admin/admin-offer-csv-import";
import { AdminOfferForm } from "@/components/admin/admin-offer-form";
import { AdminOffersList } from "@/components/admin/admin-offers-list";
import { getAdminEmail } from "@/lib/admin-auth";
import { loadAdminOffersPage, loadAdminOffersTotals } from "@/lib/admin-offers";
import { parseAdminOffersListQuery } from "@/lib/admin-offers-query";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminOffersPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const query = parseAdminOffersListQuery({
    page: firstParam(raw.page),
    sort: firstParam(raw.sort),
    q: firstParam(raw.q),
    platform: firstParam(raw.platform),
    visibility: firstParam(raw.visibility),
    source: firstParam(raw.source),
  });

  let pageResult: Awaited<ReturnType<typeof loadAdminOffersPage>> | null = null;
  let totals: Awaited<ReturnType<typeof loadAdminOffersTotals>> | null = null;
  let listError: string | null = null;

  try {
    [pageResult, totals] = await Promise.all([
      loadAdminOffersPage(query),
      loadAdminOffersTotals(),
    ]);
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
        ) : pageResult ? (
          <AdminOffersList
            offers={pageResult.offers}
            totals={totals}
            meta={pageResult.meta}
            query={query}
          />
        ) : null}
        <AdminOfferCsvImport />
        <AdminOfferForm />
      </div>
    </section>
  );
}
