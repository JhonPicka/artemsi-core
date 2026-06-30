"use client";

import Link from "next/link";
import { useState } from "react";

import { getFreshLoginPath, getFreshSignupPath } from "@/lib/auth-paths";
import {
  buildLandingFaqJsonLd,
  FAQ_CATEGORIES,
  getLandingFaqEntries,
  type LandingFaqEntry,
} from "@/lib/landing-faq-content";
import { legalConfig, legalRoutes } from "@/lib/legal-config";

function FaqAnswerBody({ entry }: { entry: LandingFaqEntry }) {
  switch (entry.id) {
    case "inscription":
      return (
        <p>
          Rends-toi sur{" "}
          <Link href={getFreshSignupPath()}>{legalConfig.publicSiteLabel}/signup</Link>, inscris-toi
          avec ton email et un mot de passe — sans carte bancaire. Complète l&apos;onboarding en
          quelques minutes (métier visé, région, école, type de contrat) pour recevoir tes premières
          offres matchées et accéder au suivi de candidatures. Tu pourras passer Pro depuis ton
          dashboard quand tu le souhaites.
        </p>
      );
    case "prix-annulation":
      return (
        <p>
          {entry.answerText}{" "}
          <Link href={legalRoutes.terms}>Détails dans les CGU</Link>.
        </p>
      );
    case "gratuit-pro":
      return (
        <p>
          {entry.answerText}{" "}
          <Link href="/#landing-prix">Compare les formules</Link> sur la page tarifs.
        </p>
      );
    case "relancer-recruteur":
      return (
        <p>
          {entry.answerText} <Link href={getFreshSignupPath()}>Crée ton espace candidat gratuit</Link> pour
          centraliser tes candidatures et tes relances.
        </p>
      );
    default:
      return <p>{entry.answerText}</p>;
  }
}

type CategoryKey = LandingFaqEntry["category"];
const ALL = "__all__" as const;
type FilterValue = CategoryKey | typeof ALL;

export function LandingFaq() {
  const faqEntries = getLandingFaqEntries();
  const faqJsonLd = buildLandingFaqJsonLd();

  const [active, setActive] = useState<FilterValue>(ALL);

  const categories = Object.entries(FAQ_CATEGORIES) as [CategoryKey, string][];
  const visible = active === ALL ? faqEntries : faqEntries.filter((e) => e.category === active);

  return (
    <section
      id="landing-faq"
      className="landing-section landing-faq landing-scroll-target"
      aria-labelledby="landing-faq-title"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="landing-container">
        <div className="landing-section-head landing-faq-head">
          <span className="landing-kicker">FAQ alternance</span>
          <h2 id="landing-faq-title" className="landing-section-title">
            Questions fréquentes sur la recherche d&apos;alternance ingénieur
          </h2>
          <p className="landing-section-lead">
            Salaire, timing, contrats, CV, lettre de motivation, entretien, et tout sur{" "}
            {legalConfig.brand} — les réponses pour décrocher ton alternance en ingénierie et
            industrie.
          </p>
        </div>

        <div className="landing-faq-filters" role="group" aria-label="Filtrer les questions">
          <button
            type="button"
            className={`landing-faq-filter${active === ALL ? " landing-faq-filter--active" : ""}`}
            onClick={() => setActive(ALL)}
          >
            Toutes les questions
          </button>
          {categories.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`landing-faq-filter${active === key ? " landing-faq-filter--active" : ""}`}
              onClick={() => setActive(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="landing-faq-list">
          {visible.map((entry) => (
            <details key={entry.id} className="landing-faq-item" id={`faq-${entry.id}`}>
              <summary>
                <h3 className="landing-faq-question">{entry.question}</h3>
              </summary>
              <div className="landing-faq-answer">
                <FaqAnswerBody entry={entry} />
              </div>
            </details>
          ))}
        </div>

        <p className="muted landing-faq-footer">
          Encore une question ?{" "}
          <Link href={getFreshSignupPath()}>Crée ton compte gratuit</Link>,{" "}
          <Link href={getFreshLoginPath()}>connecte-toi</Link> ou écris à{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a>.
        </p>
      </div>
    </section>
  );
}
