"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  canOpenOfferExternally,
  openOfferInNewTab,
  type OfferCardData,
} from "@/components/offers/offer-card";
import { OfferReportDeadLinkButton } from "@/components/offers/offer-report-dead-link-button";
import { trackActivity } from "@/lib/track-activity-client";
import { USER_ACTIVITY_EVENTS } from "@/lib/user-activity";

type JobboardOfferCardProps = {
  offer: OfferCardData;
  initialInterested: boolean;
  isPro?: boolean;
};

export function JobboardOfferCard({ offer, initialInterested, isPro = true }: JobboardOfferCardProps) {
  const router = useRouter();
  const [interested, setInterested] = useState(initialInterested);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const opensExternally = canOpenOfferExternally(offer);

  function handleOpenOffer() {
    if (!opensExternally) return;
    trackActivity(USER_ACTIVITY_EVENTS.OFFER_OPEN_EXTERNAL, {
      offerId: offer.id,
      offerTitle: offer.title,
      company: offer.company,
      source: "jobboard",
    });
    openOfferInNewTab(offer.url!);
  }

  async function toggleInterest(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
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
        trackActivity(USER_ACTIVITY_EVENTS.OFFER_INTEREST_REMOVE, {
          offerId: offer.id,
          offerTitle: offer.title,
        });
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
        trackActivity(USER_ACTIVITY_EVENTS.OFFER_INTEREST_ADD, {
          offerId: offer.id,
          offerTitle: offer.title,
          company: offer.company,
        });
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
      className={`offer-card offer-card--jobboard${interested ? " offer-card--interested" : ""}${opensExternally ? " offer-card--clickable" : ""}`}
      role={opensExternally ? "link" : undefined}
      tabIndex={opensExternally ? 0 : undefined}
      onClick={opensExternally ? handleOpenOffer : undefined}
      onKeyDown={
        opensExternally
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleOpenOffer();
              }
            }
          : undefined
      }
      aria-label={opensExternally ? `Ouvrir l'offre ${offer.title} dans un nouvel onglet` : undefined}
    >
      <div className="offer-card-header">
        {interested ? (
          <span className="offer-tag offer-tag--interest">Dans tes interets</span>
        ) : null}
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
          {loading ? "…" : interested ? "Intéressé ✓" : "Ça m'intéresse"}
        </button>
        {opensExternally ? (
          <a
            className="button-link offer-view-btn"
            href={offer.url!}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            Voir l&apos;offre
          </a>
        ) : null}
        <OfferReportDeadLinkButton offerId={offer.id} />
      </div>
      {message ? <p className="offer-interest-feedback muted">{message}</p> : null}
    </article>
  );
}
