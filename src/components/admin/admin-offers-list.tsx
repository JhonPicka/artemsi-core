"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { AdminOfferListRow } from "@/lib/admin-offers";
import {
  detectOfferUrlPlatform,
  OFFER_URL_PLATFORM_FILTERS,
  OFFER_URL_PLATFORM_LABELS,
  type OfferSourceFilter,
  type OfferUrlPlatformFilter,
  type OfferVisibilityFilter,
  offerUrlHostShort,
} from "@/lib/admin-offer-url-platform";
import { OFFER_DEAD_LINK_HIDE_THRESHOLD } from "@/lib/offer-link-reports";

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

function matchesSourceFilter(source: string, filter: OfferSourceFilter): boolean {
  if (filter === "all") return true;
  return source === filter;
}

function matchesVisibilityFilter(
  offer: AdminOfferListRow,
  filter: OfferVisibilityFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "hidden") return Boolean(offer.hiddenAt);
  if (filter === "public") return !offer.hiddenAt && offer.isPublic;
  return !offer.hiddenAt && !offer.isPublic;
}

function matchesSearch(offer: AdminOfferListRow, query: string): boolean {
  if (!query) return true;
  const haystack = [
    offer.title,
    offer.company ?? "",
    offer.location ?? "",
    offer.url,
    offerUrlHostShort(offer.url),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function AdminOffersList({ offers }: Props) {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<OfferUrlPlatformFilter>("all");
  const [visibility, setVisibility] = useState<OfferVisibilityFilter>("all");
  const [source, setSource] = useState<OfferSourceFilter>("all");

  const normalizedSearch = search.trim().toLowerCase();

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      if (!matchesSearch(offer, normalizedSearch)) return false;
      if (platform !== "all" && detectOfferUrlPlatform(offer.url) !== platform) return false;
      if (!matchesVisibilityFilter(offer, visibility)) return false;
      if (!matchesSourceFilter(offer.source, source)) return false;
      return true;
    });
  }, [offers, normalizedSearch, platform, visibility, source]);

  const hiddenCount = offers.filter((offer) => offer.hiddenAt).length;
  const hasActiveFilters =
    normalizedSearch.length > 0 || platform !== "all" || visibility !== "all" || source !== "all";

  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) return;
    const id = window.location.hash.slice(1);
    const row = document.getElementById(id);
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [filteredOffers]);

  function resetFilters() {
    setSearch("");
    setPlatform("all");
    setVisibility("all");
    setSource("all");
  }

  if (offers.length === 0) {
    return (
      <section className="card admin-offer-step">
        <h2>Offres en base</h2>
        <p className="muted">Aucune offre pour le moment.</p>
      </section>
    );
  }

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

      <div className="admin-offers-filters">
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
            onChange={(e) => setPlatform(e.target.value as OfferUrlPlatformFilter)}
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
            onChange={(e) => setVisibility(e.target.value as OfferVisibilityFilter)}
          >
            <option value="all">Toutes</option>
            <option value="public">Publiques</option>
            <option value="private">Privées</option>
            <option value="hidden">Masquées</option>
          </select>
        </label>

        <label className="admin-offers-filter-field">
          <span className="admin-offers-filter-label">Source ARTEMSI</span>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as OfferSourceFilter)}
          >
            <option value="all">Toutes</option>
            <option value="partner">Partenaire</option>
            <option value="autre">Autre</option>
            <option value="indeed">Indeed (import)</option>
          </select>
        </label>

        {hasActiveFilters ? (
          <button type="button" className="button-link secondary-link admin-offers-filter-reset" onClick={resetFilters}>
            Réinitialiser
          </button>
        ) : null}
      </div>

      <p className="muted small-label admin-offers-filter-summary">
        {filteredOffers.length === offers.length
          ? `${offers.length} offre(s) affichée(s)`
          : `${filteredOffers.length} / ${offers.length} offre(s) affichée(s)`}
      </p>

      {filteredOffers.length === 0 ? (
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
              {filteredOffers.map((offer) => {
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
    </section>
  );
}
