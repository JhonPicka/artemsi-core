import { SubscribeButton } from "@/components/billing/subscribe-button";
import { legalConfig } from "@/lib/legal-config";

type PricingGroup = {
  title: string;
  items: readonly string[];
};

const GROUPS: PricingGroup[] = [
  {
    title: "Offres & matching",
    items: [
      "Offres ciblées selon ton profil (métier, région, contrat)",
      "Nouvelles opportunités ajoutées en continu dans ton espace",
      "Lien direct pour postuler rapidement à chaque offre",
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
      "Rendez-vous d'1 h en direct (CV, lettre, entretiens)",
      "Environ 10 offres ciblées ajoutées par jour",
      "Confirmation équipe + compte rendu dans l'app",
    ],
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
            Pour 19,90&nbsp;EUR/mois&nbsp;: des offres ciblées qui matchent ton profil, un seul
            endroit pour candidater, suivre et progresser.
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
                  <span>Accès immédiat après souscription</span>
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
                    className="landing-pricing-group"
                  >
                    {groupIndex > 0 ? <div className="landing-pricing-group-rule" /> : null}
                    <h3 className="landing-pricing-group-title">{group.title}</h3>
                    <ul className="landing-pricing-group-list">
                      {group.items.map((item) => (
                        <li key={item} className="landing-pricing-group-item">
                          <CheckIcon />
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
