import Link from "next/link";

import { buildOffersHref, type OffersView } from "@/lib/offers-dashboard";

type JobboardPaginationProps = {
  page: number;
  totalPages: number;
  q: string;
};

export function JobboardPagination({ page, totalPages, q }: JobboardPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const view: OffersView = "jobboard";
  const prevHref = page > 1 ? buildOffersHref({ view, page: page - 1, q }) : null;
  const nextHref = page < totalPages ? buildOffersHref({ view, page: page + 1, q }) : null;

  return (
    <nav className="jobboard-pagination" aria-label="Pagination jobboard">
      {prevHref ? (
        <Link href={prevHref} className="button-link secondary-link jobboard-pagination-btn">
          ← Précédent
        </Link>
      ) : (
        <span className="jobboard-pagination-btn jobboard-pagination-btn--disabled" aria-hidden="true">
          ← Précédent
        </span>
      )}
      <span className="jobboard-pagination-status muted">
        Page {page} / {totalPages}
      </span>
      {nextHref ? (
        <Link href={nextHref} className="button-link secondary-link jobboard-pagination-btn">
          Suivant →
        </Link>
      ) : (
        <span className="jobboard-pagination-btn jobboard-pagination-btn--disabled" aria-hidden="true">
          Suivant →
        </span>
      )}
    </nav>
  );
}
