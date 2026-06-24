"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { AdminOffersPagination } from "@/components/admin/admin-offers-pagination";
import type { AdminOfferListRow, AdminOffersTotals } from "@/lib/admin-offers";
import {
  ADMIN_OFFERS_SORT_OPTIONS,
  buildAdminOffersHref,
  type AdminOffersListMeta,
  type AdminOffersListQuery,
} from "@/lib/admin-offers-query";
import {
  OFFER_URL_PLATFORM_FILTERS,
  OFFER_URL_PLATFORM_LABELS,
  detectOfferUrlPlatform,
  offerUrlHostShort,
} from "@/lib/admin-offer-url-platform";
import { OFFER_DEAD_LINK_HIDE_THRESHOLD } from "@/lib/offer-link-reports";

type Props = {
  offers: AdminOfferListRow[];
  totals: AdminOffersTotals | null;
  meta: AdminOffersListMeta;
  query: AdminOffersListQuery;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminOffersList({ offers, totals, meta, query }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(query.search);
  const [platform, setPlatform] = useState(query.platform);
  const [visibility, setVisibility] = useState(query.visibility);
  const [source, setSource] = useState(query.source);
  const [sort, setSort] = useState(query.sort);

  useEffect(() => {
    setSearch(query.search);
    setPlatform(query.platform);
    setVisibility(query.visibility);
    setSource(query.source);
    setSort(query.sort);
  }, [query]);

  const hasActiveFilters =
    query.search.length > 0 ||
    query.platform !== "all" ||
    query.visibility !== "all" ||
    query.source !== "all" ||
    query.sort !== "updated_desc";

  function navigate(next: Partial<AdminOffersListQuery>) {
    const href = buildAdminOffersHref(query, { page: 1, ...next });
    startTransition(() => {
      router.push(href);
    });
  }

  function applyFilters() {
    navigate({ search, platform, visibility, source, sort });
  }

  function resetFilters() {
    setSearch("");
    setPlatform("all");
    setVisibility("all");
    setSource("all");
    setSort("updated_desc");
    startTransition(() => {
      router.push("/admin/offres");
    });
  }

  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) return;
    const id = window.location.hash.slice(1);
    const row = document.getElementById(id);
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [offers]);

  if ((totals?.total ?? 0) === 0) {
    return (
      <section className="card admin-offer-step">
        <h2>Offres en base</h2>
        <p className="muted">Aucune offre pour le moment.</p>
      </section>
    );
  }

  const rangeStart = meta.totalFiltered === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const rangeEnd = Math.min(meta.page * meta.pageSize, meta.totalFiltered);

  return (
    <section className={`card admin-offer-step admin-offers-list${isPending ? " admin-offers-list--pending" : ""}`}>
      <h2>Offres en base ({totals?.total ?? meta.totalFiltered})</h2>
      <p className="muted admin-offer-lead">
        Modifie une offre pour corriger le titre, la description, la visibilité ou le raccourci
        candidat.
        {totals ? (
          <>
            {" "}
            Jobboard candidat (Pro) : <strong>{totals.jobboardVisible}</strong> offre(s) publiques
            visibles
            {totals.privateOnly > 0 ? ` · ${totals.privateOnly} privée(s)` : null}
            {totals.hidden > 0 ? ` · ${totals.hidden} masquée(s)` : null}.
          </>
        ) : null}
      </p>

      <form
        className="admin-offers-filters"
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters();
        }}
      >
        <label className="admin-offers-filter-field admin-offers-filter-field--search">
          <span className="admin-offers-filter-label">Recherche</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Titre, entreprise, lieu, URL…"
            autoComplete="off"
          />
        </label>

        <label className="admin-offers-filter-field">
          <span className="admin-offers-filter-label">Plateforme lien</span>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as typeof platform)}
          >
            {OFFER_URL_PLATFORM_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-offers-filter-field">
          <span className="admin-offers-filter-label">Visibilité</span>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as typeof visibility)}
          >
            <option value="all">Toutes</option>
            <option value="public">Publiques</option>
            <option value="private">Privées</option>
            <option value="hidden">Masquées</option>
          </select>
        </label>

        <label className="admin-offers-filter-field">
          <span className="admin-offers-filter-label">Source ARTEMSI</span>
          <select value={source} onChange={(e) => setSource(e.target.value as typeof source)}>
            <option value="all">Toutes</option>
            <option value="partner">Partenaire</option>
            <option value="autre">Autre</option>
            <option value="indeed">Indeed (import)</option>
          </select>
        </label>

        <label className="admin-offers-filter-field">
          <span className="admin-offers-filter-label">Tri</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            {ADMIN_OFFERS_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="admin-offers-filter-actions">
          <button type="submit" className="button-link" disabled={isPending}>
            {isPending ? "Chargement…" : "Appliquer"}
          </button>
          {hasActiveFilters ? (
            <button
              type="button"
              className="button-link secondary-link"
              onClick={resetFilters}
              disabled={isPending}
            >
              Réinitialiser
            </button>
          ) : null}
        </div>
      </form>

      <p className="muted small-label admin-offers-filter-summary">
        {meta.totalFiltered === 0
          ? "Aucun résultat"
          : `${rangeStart}–${rangeEnd} sur ${meta.totalFiltered} offre(s) · ${meta.pageSize} par page`}
      </p>

      <AdminOffersPagination query={query} page={meta.page} totalPages={meta.totalPages} />

      {offers.length === 0 ? (
        <p className="muted admin-offers-filter-empty">Aucune offre ne correspond à ces filtres.</p>
      ) : (
        <div className="admin-offers-table-wrap">
          <table className="admin-offers-table">
            <thead>
              <tr>
                <th scope="col">Titre</th>
                <th scope="col">Lien</th>
                <th scope="col">Entreprise</th>
                <th scope="col">Lieu</th>
                <th scope="col">Type</th>
                <th scope="col">Signalements</th>
                <th scope="col">Modifiée</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => {
                const urlPlatform = detectOfferUrlPlatform(offer.url);
                return (
                  <tr
                    key={offer.id}
                    id={`admin-offer-${offer.id}`}
                    className={offer.hiddenAt ? "admin-offers-row--hidden" : undefined}
                  >
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
                    <td>
                      <span className="admin-offers-link-platform">
                        {OFFER_URL_PLATFORM_LABELS[urlPlatform]}
                      </span>
                      <a
                        href={offer.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-offers-link-host muted small-label"
                      >
                        {offerUrlHostShort(offer.url)}
                      </a>
                    </td>
                    <td>{offer.company ?? "—"}</td>
                    <td>{offer.location ?? "—"}</td>
                    <td>
                      {offer.source === "partner"
                        ? "Partenaire"
                        : offer.source === "indeed"
                          ? "Indeed"
                          : "Autre"}
                    </td>
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
                    <td>{formatDate(offer.updatedAt)}</td>
                    <td className="admin-offers-table-actions">
                      <Link href={`/admin/offres/${offer.id}`} className="admin-inline-link">
                        {offer.hiddenAt ? "Corriger" : "Modifier"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AdminOffersPagination query={query} page={meta.page} totalPages={meta.totalPages} />
    </section>
  );
}
