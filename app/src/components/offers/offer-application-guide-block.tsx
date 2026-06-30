"use client";

import { useState } from "react";

import {
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
    .catch(() => onDone("Copie impossible. Sélectionne le texte manuellement."));
}

export function OfferApplicationGuideBlock({ guide: rawGuide }: OfferApplicationGuideBlockProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const guide = normalizeApplicationGuide(rawGuide);

  if (!guide?.tips.length) return null;

  return (
    <div className="offer-guide-block">
      <div className="offer-guide-head">
        <div>
          <p className="offer-guide-kicker">Raccourci candidature</p>
          <p className="offer-details-label">L&apos;essentiel pour adapter ton CV et ta lettre</p>
        </div>
        <button
          type="button"
          className="button-link secondary-link offer-guide-copy"
          onClick={() =>
            copyText(buildGuideCopyText(guide), setCopied, "Raccourci copié dans le presse-papiers.")
          }
        >
          Copier
        </button>
      </div>

      <ul className="offer-guide-list">
        {guide.tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>

      {copied ? <p className="muted offer-guide-feedback">{copied}</p> : null}
    </div>
  );
}
