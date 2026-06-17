import { REGIONS, STUDY_DOMAINS, type StudyDomain } from "@/lib/constants";
import {
  normalizeApplicationGuide,
  type OfferApplicationGuide,
} from "@/lib/offer-application-guide";
import { DOMAIN_HINTS, REGION_HINTS } from "@/lib/offer-matching";

/** Réponse JSON attendue du modèle. */
export type OfferExtractModelOutput = {
  title: string;
  company: string | null;
  location: string | null;
  description: string;
  contractHint: "alternance" | "apprentissage" | "pro" | null;
  studyDomainHint?: StudyDomain | "AUTRE" | null;
  locationKeywords?: string[];
  jobKeywords?: string[];
  applicationGuide?: { tips?: string[] } | null;
};

export type ExtractedOfferFields = {
  title: string;
  company: string | null;
  location: string | null;
  description: string;
  contractHint: string | null;
  applicationGuide: OfferApplicationGuide | null;
};

const REGION_SLUGS = REGIONS.map((r) =>
  r
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/'/g, "")
    .replace(/\s+/g, "-"),
);

const DOMAIN_LIST = STUDY_DOMAINS.join(" | ");

function buildRegionMatchingGuide() {
  const lines: string[] = [];
  for (const slug of REGION_SLUGS) {
    const hints = REGION_HINTS[slug] ?? [];
    const cities = hints.slice(0, 6).join(", ");
    if (cities) lines.push(`- ${slug} → ${cities}`);
  }
  return lines.join("\n");
}

function buildDomainMatchingGuide() {
  return STUDY_DOMAINS.filter((d) => d !== "AUTRE")
    .map((code) => {
      const hints = DOMAIN_HINTS[code] ?? [];
      return `- ${code} → ${hints.slice(0, 8).join(", ")}`;
    })
    .join("\n");
}

export const OFFER_EXTRACT_SYSTEM_PROMPT = `Tu es l'assistant ARTEMSI pour les offres d'alternance / apprentissage en France.
Tu extrais une fiche courte pour le candidat ET un raccourci concis pour adapter son CV et sa lettre.

## Règles
- Réponds UNIQUEMENT en JSON valide, sans markdown.
- N'invente JAMAIS : si une info manque, liste vide ou null.
- Français professionnel, pas d'emojis.
- Base-toi UNIQUEMENT sur l'annonce fournie.

## JSON attendu
{
  "title": string,
  "company": string | null,
  "location": string | null,
  "description": string,
  "contractHint": "alternance" | "apprentissage" | "pro" | null,
  "studyDomainHint": ${DOMAIN_LIST} | null,
  "locationKeywords": string[],
  "jobKeywords": string[],
  "applicationGuide": {
    "tips": string[]
  }
}

## title (5–90 car.)
- Métier + type de contrat si possible : « Développeur web — Alternance »
- Pas le nom d'entreprise (champ company).

## company / location
- company : raison sociale nettoyée.
- location : ville principale du poste (« Lyon (69) », « Paris 13e », « France (remote) »). null seulement si aucun indice.

## description (400–1200 car.)
Raccourci lisible en 3 blocs avec puces « • » :

Infos clés
• Lieu, contrat, rythme/durée/début si présents
• Niveau / formation si présent

Missions
• 2 à 5 missions concrètes

Profil
• 2 à 4 exigences (compétences, outils, expériences)

Interdit : blabla RH, valeurs corporate, copier l'annonce entière.

## Champs matching internes (discrets)
- locationKeywords : 1–4 villes réelles.
- jobKeywords : 3–8 mots du métier (≥ 3 lettres).
- studyDomainHint : code domaine le plus proche.

## applicationGuide (raccourci candidat — 3 à 5 items max)
Liste courte, actionnable, max 120 caractères par item. Pas de questions d'entretien.

Exemples de tips :
- « Mets en avant Python et SQL sur ton CV »
- « Bac+3 informatique ou équivalent demandé »
- « Démarrage septembre 2026 — Lyon »
- « Rythme 3j entreprise / 2j école »

Couvre si possible : compétences clés à reprendre, niveau/filière, info pratique (lieu, début, contrat).
Interdit : slogans, « passion », « dynamique », phrases vides, listes longues.

## Guides matching (pour locationKeywords / jobKeywords / description)
Régions :
${buildRegionMatchingGuide()}

Domaines :
${buildDomainMatchingGuide()}`;

export function buildOfferExtractUserMessage(url: string, raw: string) {
  return `URL source : ${url}

--- ANNONCE BRUTE ---
${raw.slice(0, 12_000)}
--- FIN ---

Extrais la fiche + le raccourci candidat (3 à 5 points). Reste factuel.`;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const LOCATION_STOP_WORDS = [
  "alternance",
  "apprentissage",
  "contrat",
  "description",
  "mission",
  "missions",
  "profil",
  "formation",
  "competences",
  "compétences",
  "remuneration",
  "rémunération",
  "salaire",
  "postuler",
  "candidature",
  "entreprise",
];

function cleanLocationCandidate(value: string) {
  const cleaned = value
    .replace(/\s+/g, " ")
    .replace(/^[\s:–—-]+|[\s,.;|–—-]+$/g, "")
    .replace(/\bFrance\b\.?$/i, "")
    .trim();

  if (cleaned.length < 2 || cleaned.length > 80) return null;
  const normalized = normalizeText(cleaned);
  if (LOCATION_STOP_WORDS.some((word) => normalized === normalizeText(word))) return null;
  if (LOCATION_STOP_WORDS.some((word) => normalized.startsWith(`${normalizeText(word)} `))) {
    return null;
  }
  return cleaned;
}

function extractLocationFromRaw(raw?: string) {
  if (!raw) return null;
  const text = raw.replace(/\r/g, "\n");

  const patterns: RegExp[] = [
    /(?:lieu|localisation|adresse|site|ville)\s*[:\-]\s*([^\n•|]{2,90})/i,
    /(?:poste\s+bas[ée]?\s+à|bas[ée]?\s+à|localis[ée]?\s+à|situ[ée]?\s+à|à\s+pourvoir\s+à|sur\s+le\s+site\s+de)\s+([A-ZÀ-Ÿ][A-Za-zÀ-ÿ'’.\- ]{2,70})/i,
    /\b(\d{5})\s+([A-ZÀ-Ÿ][A-Za-zÀ-ÿ'’.\-\s]{2,60})\b/,
    /\b([A-ZÀ-Ÿ][A-Za-zÀ-ÿ'’.\-\s]{2,50})\s*\((\d{2,3})\)/,
    /\b(Paris\s+(?:\d{1,2}(?:e|er|ème|eme)?))\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;

    if (pattern.source.includes("\\d{5}") && match[1] && match[2]) {
      const city = cleanLocationCandidate(match[2]);
      if (city) return `${city} (${match[1].slice(0, 2)})`;
    }

    if (pattern.source.includes("\\(\\d{2,3}\\)") && match[1] && match[2]) {
      const city = cleanLocationCandidate(match[1]);
      if (city) return `${city} (${match[2]})`;
    }

    const candidate = cleanLocationCandidate(match[1] ?? "");
    if (candidate) return candidate;
  }

  if (/100\s*%\s*(?:télétravail|teletravail|remote)|full\s+remote/i.test(text)) {
    return "France (remote)";
  }

  return null;
}

function normalizeContractHint(
  hint: OfferExtractModelOutput["contractHint"] | string | null | undefined,
): string | null {
  if (!hint) return null;
  const v = String(hint).toLowerCase().trim();
  if (v === "alternance" || v === "apprentissage" || v === "pro") return v;
  if (v.includes("apprenti")) return "apprentissage";
  if (v.includes("professionnalisation") || v === "contrat pro") return "pro";
  if (v.includes("altern")) return "alternance";
  return null;
}

function buildFallbackGuideFromText(
  parsed: Partial<OfferExtractModelOutput>,
  raw?: string,
): OfferApplicationGuide | null {
  const tips: string[] = [];

  for (const kw of (parsed.jobKeywords ?? []).slice(0, 2)) {
    tips.push(`Mets en avant : ${kw}`);
  }

  const haystack = normalizeText(
    `${parsed.title ?? ""} ${parsed.description ?? ""} ${raw ?? ""}`,
  );
  if (/bac\s*\+\s*[345]/i.test(haystack)) {
    tips.push("Précise ton niveau d'études (Bac+X) sur ton CV");
  }
  if (parsed.location) tips.push(`Poste basé à ${parsed.location}`);
  if (parsed.contractHint) tips.push(`Contrat : ${parsed.contractHint}`);

  return normalizeApplicationGuide({ tips });
}

export function finalizeExtractedOffer(
  parsed: Partial<OfferExtractModelOutput>,
  raw?: string,
): ExtractedOfferFields | null {
  if (!parsed.title?.trim() || !parsed.description?.trim()) return null;

  const contractHint = normalizeContractHint(parsed.contractHint);
  const title = String(parsed.title).trim().slice(0, 200);
  const company = parsed.company ? String(parsed.company).trim().slice(0, 200) : null;
  const parsedLocation = parsed.location ? cleanLocationCandidate(String(parsed.location)) : null;
  const location = (parsedLocation ?? extractLocationFromRaw(raw))?.slice(0, 200) ?? null;
  const description = String(parsed.description).trim().slice(0, 4000);

  let applicationGuide =
    normalizeApplicationGuide(parsed.applicationGuide) ??
    buildFallbackGuideFromText(parsed, raw);

  if (applicationGuide && location) {
    const city = location.split(/[,(]/)[0]?.trim() ?? "";
    const hasLocationTip = applicationGuide.tips.some((t) =>
      normalizeText(t).includes(normalizeText(city)),
    );
    if (city.length >= 3 && !hasLocationTip) {
      applicationGuide = normalizeApplicationGuide({
        tips: [`Poste basé à ${location}`, ...applicationGuide.tips],
      });
    }
  }

  return {
    title,
    company,
    location,
    description,
    contractHint,
    applicationGuide,
  };
}
