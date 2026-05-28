import { SubscribeButton } from "@/components/billing/subscribe-button";
import { legalConfig } from "@/lib/legal-config";

type PricingGroup = {
  title: string;
  items: readonly string[];
  muted?: boolean;
};

const GROUPS: PricingGroup[] = [
  {
    title: "Offres & matching",
    items: [
      "Offres ciblées selon ton profil (métier, région, contrat)",
      "Sélection depuis des sites carrières officiels et sources entreprises",
      "Propositions directement dans ton espace — sans ouvrir dix onglets",
    ],
  },
  {
    title: "Suivi & documents",
    items: [
      "Suivi des candidatures (envoyée, entretien, réponse…)",
      "CV et lettre de motivation prêts depuis ton profil",
    ],
  },
  {
    title: "Profil & accompagnement",
    items: [
      "Audit CV / LM sur créneau réservé dans l'app",
      "Support et accompagnement personnalisé",
    ],
  },
  {
    title: "Prochainement",
    items: ["Alertes e-mail sur les nouvelles offres"],
    muted: true,
  },
];

function CheckIcon() {
  return (
    <svg
      className="landing-pricing-check"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg
      className="landing-pricing-check landing-pricing-check--muted"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

export function LandingPricingShowcase() {
  return (
    <section
      id="landing-prix"
      className="landing-section landing-pricing landing-scroll-target"
      aria-labelledby="landing-pricing-title"
    >
      <div className="landing-container">
        <div className="landing-section-head landing-pricing-head">
          <span className="landing-kicker">Tarif</span>
          <h2 id="landing-pricing-title" className="landing-section-title">
            Un investissement qui va changer ta recherche d&apos;alternance
          </h2>
          <p className="landing-section-lead">
            Pour 19,90&nbsp;EUR/mois&nbsp;: des offres issues de sources officielles qui matchent
            ton profil, un seul endroit pour candidater et suivre.
          </p>
        </div>

        <div className="landing-pricing-panel">
          <div className="landing-pricing-panel-grid">
            <aside className="landing-pricing-aside">
              <p className="landing-pricing-plan-label">
                <span className="landing-pricing-plan-dot" aria-hidden="true" />
                Offre ARTEMSI · Alternance
              </p>

              <p className="landing-pricing-price" aria-label="19,90 euros TTC par mois">
                <span className="landing-pricing-amount">19,90&nbsp;€</span>
                <span className="landing-pricing-period">
                  <span>TTC</span>
                  <span>/&nbsp;mois</span>
                </span>
              </p>

              <p className="landing-pricing-tagline">
                Une seule formule, pensée pour l&apos;alternance.
              </p>

              <ul className="landing-pricing-aside-meta" aria-label="Conditions">
                <li>
                  <CheckIcon />
                  <span>Paiement sécurisé (Stripe)</span>
                </li>
                <li>
                  <CheckIcon />
                  <span>Lien de connexion envoye apres souscription</span>
                </li>
                <li>
                  <CheckIcon />
                  <span>Résiliable selon les CGU</span>
                </li>
              </ul>

              <div className="landing-cta-row landing-pricing-cta">
                <SubscribeButton className="button-link landing-cta-primary">
                  S&apos;abonner
                  <span className="landing-cta-arrow" aria-hidden="true">
                    →
                  </span>
                </SubscribeButton>
                <a
                  className="button-link secondary-link landing-cta-secondary"
                  href={`mailto:${legalConfig.contactEmail}`}
                >
                  Nous contacter
                </a>
              </div>
            </aside>

            <div className="landing-pricing-features">
              <p className="landing-pricing-features-title">Ce que tu obtiens</p>

              <div className="landing-pricing-groups">
                {GROUPS.map((group, groupIndex) => (
                  <div
                    key={group.title}
                    className={`landing-pricing-group${
                      group.muted ? " landing-pricing-group--muted" : ""
                    }`}
                  >
                    {groupIndex > 0 ? <div className="landing-pricing-group-rule" /> : null}
                    <h3 className="landing-pricing-group-title">{group.title}</h3>
                    <ul className="landing-pricing-group-list">
                      {group.items.map((item) => (
                        <li key={item} className="landing-pricing-group-item">
                          {group.muted ? <DotIcon /> : <CheckIcon />}
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
