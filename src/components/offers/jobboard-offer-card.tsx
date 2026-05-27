"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { OfferFullscreenModal, type OfferCardData } from "@/components/offers/offer-card";

const SOURCE_LABEL: Record<OfferCardData["source"], string> = {
  indeed: "Source externe",
  partner: "Partenaire",
  autre: "Autre",
};

type JobboardOfferCardProps = {
  offer: OfferCardData;
  initialInterested: boolean;
};

export function JobboardOfferCard({ offer, initialInterested }: JobboardOfferCardProps) {
  const router = useRouter();
  const [interested, setInterested] = useState(initialInterested);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  async function toggleInterest() {
    setLoading(true);
    setMessage(null);
    try {
      if (interested) {
        const res = await fetch(`/api/offers/interests?offerId=${offer.id}`, {
          method: "DELETE",
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error ?? "Erreur");
        setInterested(false);
        setMessage("Retire de tes centres d'interet.");
      } else {
        const res = await fetch("/api/offers/interests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offerId: offer.id }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error ?? "Erreur");
        setInterested(true);
        setMessage(
          body.assignmentCreated
            ? "Ajoute a ton profil — des offres similaires t'arriveront dans « Pour toi »."
            : "Preference enregistree — tu recevras plus d'offres de ce type.",
        );
        router.refresh();
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article
      className={`offer-card offer-card--jobboard${interested ? " offer-card--interested" : ""}`}
    >
      <div className="offer-card-header">
        {interested ? (
          <span className="offer-tag offer-tag--interest">Dans tes interets</span>
        ) : null}
        <span className="offer-tag muted-tag">{SOURCE_LABEL[offer.source]}</span>
      </div>
      <h3 className="offer-title">{offer.title}</h3>
      <p className="offer-meta">
        {offer.company ? <span>{offer.company}</span> : null}
        {offer.company && offer.location ? <span> - </span> : null}
        {offer.location ? <span>{offer.location}</span> : null}
      </p>
      <div className="offer-card-actions offer-card-actions--compact">
        <button
          type="button"
          className={`button-link secondary-link offer-interest-btn${interested ? " is-active" : ""}`}
          onClick={toggleInterest}
          disabled={loading}
          aria-pressed={interested}
        >
          {loading ? "…" : interested ? "Interesse ✓" : "Ca m'interesse"}
        </button>
        <button
          type="button"
          className="button-link offer-view-btn"
          onClick={() => setDetailsOpen(true)}
          aria-expanded={detailsOpen}
        >
          Voir l&apos;offre
        </button>
      </div>
      {detailsOpen ? (
        <OfferFullscreenModal offer={offer} onClose={() => setDetailsOpen(false)} />
      ) : null}
      {message ? <p className="offer-interest-feedback muted">{message}</p> : null}
    </article>
  );
}
