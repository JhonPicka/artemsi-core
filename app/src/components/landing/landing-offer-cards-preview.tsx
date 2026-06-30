type OfferPreview = {
  title: string;
  company: string;
  location: string;
  interested?: boolean;
  tag: string;
  tagMuted?: boolean;
};

const OFFERS: OfferPreview[] = [
  {
    title: "Technicien Supply Chain — Apprentissage",
    company: "Dassault Aviation",
    location: "Seclin (59)",
    interested: true,
    tag: "Partenaire",
    tagMuted: true,
  },
  {
    title: "Chef de projet SRM — Alternance",
    company: "Safran",
    location: "Malakoff",
    tag: "Nouveau",
  },
];

export function LandingOfferCardsPreview() {
  return (
    <div className="landing-offer-cards-preview offers-grid">
      {OFFERS.map((offer) => (
        <article
          key={offer.title}
          className={`offer-card offer-card--jobboard landing-offer-card-preview${
            offer.interested ? " offer-card--interested" : ""
          }`}
        >
          <div className="offer-card-header">
            {offer.interested ? (
              <span className="offer-tag offer-tag--interest">Dans tes intérêts</span>
            ) : null}
            <span className={`offer-tag${offer.tagMuted ? " muted-tag" : ""}`}>{offer.tag}</span>
          </div>
          <h3 className="offer-title">{offer.title}</h3>
          <p className="offer-meta">
            <span>{offer.company}</span>
            <span> - </span>
            <span>{offer.location}</span>
          </p>
          <div className="offer-card-actions offer-card-actions--compact">
            <span className="button-link secondary-link offer-interest-btn" aria-hidden="true">
              {offer.interested ? "Intéressé ✓" : "Ça m'intéresse"}
            </span>
            <span className="button-link offer-view-btn" aria-hidden="true">
              Voir l'offre
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
