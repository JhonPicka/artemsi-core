import Link from "next/link";

import { OFFER_DEAD_LINK_HIDE_THRESHOLD } from "@/lib/offer-link-reports";
import type { AdminOfferListRow } from "@/lib/admin-offers";

type Props = {
  offers: AdminOfferListRow[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminOffersList({ offers }: Props) {
  if (offers.length === 0) {
    return (
      <section className="card admin-offer-step">
        <h2>Offres en base</h2>
        <p className="muted">Aucune offre pour le moment.</p>
      </section>
    );
  }

  const hiddenCount = offers.filter((offer) => offer.hiddenAt).length;

  return (
    <section className="card admin-offer-step admin-offers-list">
      <h2>Offres en base ({offers.length})</h2>
      <p className="muted admin-offer-lead">
        Modifie une offre pour corriger le titre, la description, la visibilité ou le raccourci
        candidat.
        {hiddenCount > 0
          ? ` ${hiddenCount} offre(s) masquée(s) après ${OFFER_DEAD_LINK_HIDE_THRESHOLD} signalements.`
          : null}
      </p>

      <div className="admin-offers-table-wrap">
        <table className="admin-offers-table">
          <thead>
            <tr>
              <th scope="col">Titre</th>
              <th scope="col">Entreprise</th>
              <th scope="col">Lieu</th>
              <th scope="col">Type</th>
              <th scope="col">Signalements</th>
              <th scope="col">Ajoutée</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id} className={offer.hiddenAt ? "admin-offers-row--hidden" : undefined}>
                <td>
                  <span className="admin-offers-table-title">{offer.title}</span>
                  {offer.hiddenAt ? (
                    <span className="admin-offers-badge danger-badge">Masquée</span>
                  ) : offer.isPublic ? (
                    <span className="admin-offers-badge">Public</span>
                  ) : (
                    <span className="admin-offers-badge muted-badge">Privée</span>
                  )}
                  {offer.isPartnerExclusive ? (
                    <span className="admin-offers-badge accent-badge">Exclusive</span>
                  ) : null}
                </td>
                <td>{offer.company ?? "—"}</td>
                <td>{offer.location ?? "—"}</td>
                <td>{offer.source === "partner" ? "Partenaire" : "Autre"}</td>
                <td>
                  {offer.linkReportCount > 0 ? (
                    <span
                      className={
                        offer.linkReportCount >= OFFER_DEAD_LINK_HIDE_THRESHOLD
                          ? "admin-offers-report-count is-critical"
                          : "admin-offers-report-count"
                      }
                    >
                      {offer.linkReportCount}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{formatDate(offer.createdAt)}</td>
                <td className="admin-offers-table-actions">
                  <Link href={`/admin/offres/${offer.id}`} className="admin-inline-link">
                    {offer.hiddenAt ? "Corriger" : "Modifier"}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
