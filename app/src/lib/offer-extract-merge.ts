import {
  finalizeExtractedOffer,
  type ExtractedOfferFields,
  type OfferExtractModelOutput,
} from "@/lib/offer-extract-prompt";
import type { StructuredOfferHints } from "@/lib/offer-structured-extract";

/**
 * Fusionne les hints déterministes et la sortie IA.
 * Priorité : hints fiables (JSON-LD / texte collé structuré) > IA > null
 */
export function mergeAiWithStructuredHints(
  ai: Partial<OfferExtractModelOutput>,
  hints: StructuredOfferHints,
  raw: string,
  url?: string,
): ExtractedOfferFields | null {
  const merged: Partial<OfferExtractModelOutput> = {
    ...ai,
    title: hints.title ?? ai.title,
    company: hints.company ?? ai.company,
    location: hints.location ?? ai.location,
    contractHint: hints.contractHint ?? ai.contractHint ?? null,
  };

  if (!merged.description?.trim() && hints.rawDescription) {
    merged.description = hints.rawDescription;
  }

  return finalizeExtractedOffer(merged, raw, url);
}

export function fieldsFromStructuredHintsOnly(
  hints: StructuredOfferHints,
  raw: string,
  url?: string,
): ExtractedOfferFields | null {
  if (!hints.rawDescription && !hints.title) return null;

  const description =
    hints.rawDescription ??
    [hints.title, hints.company, hints.location].filter(Boolean).join("\n");

  return finalizeExtractedOffer(
    {
      title: hints.title ?? "Offre alternance",
      company: hints.company,
      location: hints.location,
      description,
      contractHint: hints.contractHint,
    },
    raw,
    url,
  );
}
