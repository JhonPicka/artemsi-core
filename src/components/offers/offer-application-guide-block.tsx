"use client";

import { useState } from "react";

import {
  applicationGuideHasContent,
  buildGuideCopyText,
  normalizeApplicationGuide,
  type OfferApplicationGuide,
} from "@/lib/offer-application-guide";

type OfferApplicationGuideBlockProps = {
  guide: OfferApplicationGuide | unknown | null | undefined;
};

function copyText(value: string, onDone: (message: string) => void, message: string) {
  if (!navigator.clipboard) {
    onDone("Copie indisponible sur ce navigateur.");
    return;
  }
  navigator.clipboard
    .writeText(value)
    .then(() => onDone(message))
    .catch(() => onDone("Copie impossible. Selectionne le texte manuellement."));
}

function GuideSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="offer-guide-section">
      <p className="offer-details-label">{title}</p>
      <ul className="offer-guide-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function OfferApplicationGuideBlock({ guide: rawGuide }: OfferApplicationGuideBlockProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const guide = normalizeApplicationGuide(rawGuide);

  if (!applicationGuideHasContent(guide)) return null;

  const safeGuide = guide!;

  return (
    <div className="offer-guide-block">
      <div className="offer-guide-head">
        <div>
          <p className="offer-guide-kicker">Prépare ta candidature</p>
          <p className="offer-details-label">
            Guide CV &amp; lettre pour ce poste
          </p>
        </div>
        <button
          type="button"
          className="button-link secondary-link offer-guide-copy"
          onClick={() =>
            copyText(buildGuideCopyText(safeGuide), setCopied, "Guide copié dans le presse-papiers.")
          }
        >
          Copier tout le guide
        </button>
      </div>

      <GuideSection title="Compétences à mettre en avant (CV)" items={safeGuide.cvEssentials.competencies} />
      <GuideSection title="Cursus & formation (CV)" items={safeGuide.cvEssentials.education} />
      <GuideSection title="Profil recherché (CV)" items={safeGuide.cvEssentials.profile} />
      <GuideSection title="Infos clés (dates, rythme, contrat…)" items={safeGuide.cvEssentials.keyFacts} />
      <GuideSection title="Angles pour ta lettre de motivation" items={safeGuide.letterAngles} />
      <GuideSection title="Questions typiques en entretien" items={safeGuide.typicalQuestions} />
      <GuideSection title="Questions à poser au recruteur" items={safeGuide.questionsToAsk} />

      {copied ? <p className="muted offer-guide-feedback">{copied}</p> : null}
      <p className="muted offer-guide-hint">
        Utilise ce guide pour adapter ton CV et ta lettre avant de postuler via le lien officiel.
      </p>
    </div>
  );
}
