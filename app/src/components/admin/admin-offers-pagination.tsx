import Link from "next/link";

import {
  buildAdminOffersHref,
  type AdminOffersListQuery,
} from "@/lib/admin-offers-query";

type Props = {
  query: AdminOffersListQuery;
  page: number;
  totalPages: number;
};

export function AdminOffersPagination({ query, page, totalPages }: Props) {
  if (totalPages <= 1) {
    return null;
  }

  const prevHref =
    page > 1 ? buildAdminOffersHref(query, { page: page - 1 }) : null;
  const nextHref =
    page < totalPages ? buildAdminOffersHref(query, { page: page + 1 }) : null;

  return (
    <nav className="admin-offers-pagination" aria-label="Pagination offres admin">
      {prevHref ? (
        <Link href={prevHref} className="button-link secondary-link admin-offers-pagination-btn">
          ← Précédent
        </Link>
      ) : (
        <span
          className="admin-offers-pagination-btn admin-offers-pagination-btn--disabled"
          aria-hidden="true"
        >
          ← Précédent
        </span>
      )}
      <span className="admin-offers-pagination-status muted">
        Page {page} / {totalPages}
      </span>
      {nextHref ? (
        <Link href={nextHref} className="button-link secondary-link admin-offers-pagination-btn">
          Suivant →
        </Link>
      ) : (
        <span
          className="admin-offers-pagination-btn admin-offers-pagination-btn--disabled"
          aria-hidden="true"
        >
          Suivant →
        </span>
      )}
    </nav>
  );
}
