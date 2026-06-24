import { REGIONS, STUDY_DOMAINS, type StudyDomain } from "@/lib/constants";
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
};

export type ExtractedOfferFields = {
  title: string;
  company: string | null;
  location: string | null;
  description: string;
  contractHint: string | null;
};

const REGION_SLUGS = REGIONS.map((r) =>
  r
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/'/g, "")
    .replace(/\s+/g, "-"),
);

const DOMAIN_LIST = STUDY_DOMAINS.join(" | ");

const TITLE_JUNK_PATTERNS = [
  /\s*[-|–—]\s*offre\s*n[°o]?\s*\d+/i,
  /\s*[-|–—]\s*hellowork\b.*/i,
  /\s*[-|–—]\s*indeed\b.*/i,
  /\s*[-|–—]\s*linkedin\b.*/i,
  /\s*\|\s*recrutement\b.*/i,
  /\s*[-|–—]\s*recrutement\b.*/i,
  /\s+h\/f\s*$/i,
  /\s+f\/h\s*$/i,
  /\s*\(h\/f\)\s*$/i,
  /\s*\(f\/h\)\s*$/i,
];

const CORPORATE_BULLET_PATTERNS = [
  /écosystème\s+digital/i,
  /environnement\s+de\s+travail/i,
  /esprit\s+du\s+collectif/i,
  /happy\s+trainees/i,
  /afterworks?/i,
  /séminaire\s+d['’]intégration/i,
  /perspective\s+d['’]évolution\s+en\s+cdi/i,
  /culture\s+d['’]entreprise/i,
  /engagement\s+associatif/i,
  /expérience\s+humaine\s+riche/i,
  /innovant/i,
  /stimulant/i,
];

const LOCATION_CANONICAL: Record<string, string> = {
  "la defense": "La Défense (92)",
  "la défense": "La Défense (92)",
};

const GENERIC_ROLE_TITLES = new Set([
  "audit",
  "commerce",
  "marketing",
  "finance",
  "rh",
  "ingenierie",
  "ingénierie",
  "informatique",
  "logistique",
  "communication",
  "design",
  "droit",
  "industrie",
]);

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

export const OFFER_EXTRACT_SYSTEM_PROMPT = `Tu es rédacteur données recrutement chez ARTEMSI (alternance & apprentissage, France).
Tu extrais une fiche FACTUELLE à partir d'une annonce : aucun conseil, aucune recommandation, aucune reformulation marketing.

## Sortie
Réponds UNIQUEMENT en JSON valide (pas de markdown, pas de commentaire).

## Principes
1. Faits uniquement : reprendre ou condenser ce qui est écrit dans l'annonce.
2. Zéro invention : si une info manque, null ou liste vide.
3. Français neutre et professionnel. Pas d'emojis.
4. Pas de conseils au candidat (« mettez en avant », « vérifiez », « soyez »…).
5. Ne cite jamais HelloWork, Indeed, LinkedIn ni le nom d'un jobboard.
6. Ignore le bruit (menus, cookies, footer, offres similaires).

## Schéma JSON
{
  "title": string,
  "company": string | null,
  "location": string | null,
  "description": string,
  "contractHint": "alternance" | "apprentissage" | "pro" | null,
  "studyDomainHint": ${DOMAIN_LIST} | null,
  "locationKeywords": string[],
  "jobKeywords": string[]
}

## title (25–90 caractères)
- Intitulé métier précis + contrat : « Alternant(e) audit — Alternance », « Ingénieur supply chain — Apprentissage ».
- Jamais un intitulé trop court ou générique seul (« Audit », « Commerce », « RH ») : précise le rôle (alternant, assistant, ingénieur, technicien…).
- Déduis le métier des missions si le titre source est absent ou marketing.
- Pas d'entreprise, pas de ville, pas de H/F, pas de n° d'offre.

Exemples :
✓ « Alternant(e) audit — Alternance »
✓ « Auditeur financier — Alternance »
✗ « Audit — Alternance »
✗ « KPMG — Alternance »

## company
- Raison sociale uniquement (ex. « KPMG », « Safran »).

## location
- Lieu de travail : ville + département si identifiable (« La Défense (92) », « Lyon (69) », « Paris 13e »).
- Si un site ou campus est mentionné, tu peux l'ajouter : « La Défense (92) — Tour EQHO ».
- « France (télétravail) » seulement si full remote explicite.
- null si inconnu.

## description (500–1100 caractères)
Structure EXACTE — 3 blocs, titres de section + puces « • », phrases courtes et factuelles :

Infos clés
• Type de contrat et durée (ex. alternance 12 ou 24 mois)
• Lieu, site ou campus + modalité (présentiel, hybride, télétravail)
• Niveau / diplôme attendu
• Date de début si mentionnée
• Rémunération si mentionnée

Missions
• 3 à 5 actions concrètes tirées de l'annonce (audit, analyse, production, relation client opérationnelle…)
• Verbes d'action : participer, réaliser, analyser, contribuer, accompagner…

Profil
• 2 à 4 exigences mesurables : diplôme, domaine, outils, langues (niveau), expérience

Interdit dans description :
- conseils au candidat, slogans RH, promesses employeur
- soft skills vagues seules (« dynamique », « passionné », « esprit d'équipe » sans autre critère)
- avantages lifestyle (afterworks, Happy Trainees, CDI, séminaire d'intégration, culture d'entreprise)
- phrases corporate creuses (« écosystème digital innovant », « environnement de qualité »)
- paragraphes continus sans puces

## Champs matching internes (ne pas mettre dans description)
- locationKeywords : 1–4 villes réelles.
- jobKeywords : 3–8 termes métier (≥ 3 lettres).
- studyDomainHint : code domaine le plus proche.

Régions :
${buildRegionMatchingGuide()}

Domaines :
${buildDomainMatchingGuide()}`;

export function buildOfferExtractUserMessage(url: string, raw: string) {
  return `URL source : ${url}

Extrais les faits de l'annonce ci-dessous (JSON uniquement, sans conseils candidat).

--- ANNONCE BRUTE ---
${raw.slice(0, 12_000)}
--- FIN ---`;
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
    /localisation\s*:\s*([^\n•|]{2,90})/i,
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
    return "France (télétravail)";
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

function toTitleCase(value: string) {
  const lower = value.toLowerCase();
  return lower.replace(/(^|[\s/—-])(\p{L})/gu, (match, sep, letter) => `${sep}${letter.toUpperCase()}`);
}

function cleanExtractedTitle(title: string, company: string | null, contractHint: string | null) {
  let cleaned = title.replace(/\s+/g, " ").trim();

  for (const pattern of TITLE_JUNK_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }

  cleaned = cleaned.replace(/\s*[-|–—]\s*$/g, "").trim();

  if (company) {
    const companyNorm = normalizeText(company);
    const parts = cleaned.split(/\s*[-|–—]\s*/);
    if (parts.length > 1 && normalizeText(parts[0] ?? "") === companyNorm) {
      cleaned = parts.slice(1).join(" — ");
    }
  }

  if (cleaned === cleaned.toUpperCase() && cleaned.length > 8) {
    cleaned = toTitleCase(cleaned);
  }

  const hasContract = /alternance|apprentissage|contrat pro/i.test(cleaned);
  if (!hasContract && contractHint) {
    const suffix =
      contractHint === "apprentissage"
        ? "Apprentissage"
        : contractHint === "pro"
          ? "Contrat pro"
          : "Alternance";
    cleaned = `${cleaned} — ${suffix}`;
  }

  return cleaned.slice(0, 200);
}

function cleanExtractedCompany(company: string | null) {
  if (!company) return null;
  const cleaned = company
    .replace(/\s+/g, " ")
    .replace(/^(chez|entreprise|société|societe)\s+/i, "")
    .replace(/\s*[-|–—].*$/, "")
    .trim();
  return cleaned.length >= 2 ? cleaned.slice(0, 200) : null;
}

function improveGenericTitle(title: string, contractHint: string | null, raw?: string) {
  const suffixMatch = title.match(/\s*—\s*(Alternance|Apprentissage|Contrat pro)\s*$/i);
  const suffix =
    suffixMatch?.[1] ??
    (contractHint === "apprentissage"
      ? "Apprentissage"
      : contractHint === "pro"
        ? "Contrat pro"
        : "Alternance");
  const rolePart = suffixMatch ? title.replace(/\s*—\s*(Alternance|Apprentissage|Contrat pro)\s*$/i, "").trim() : title;
  const roleNorm = normalizeText(rolePart);

  if (roleNorm.length > 14 || !GENERIC_ROLE_TITLES.has(roleNorm)) {
    return title;
  }

  const haystack = normalizeText(`${raw ?? ""} ${title}`);
  const roleMap: [RegExp, string][] = [
    [/\baudit\b/, "Alternant(e) audit"],
    [/\bauditeur\b/, "Auditeur"],
    [/\bingénieur\b|\bingenieur\b/, "Ingénieur"],
    [/\bcommercial\b/, "Commercial"],
    [/\bmarketing\b/, "Assistant(e) marketing"],
    [/\bdeveloppeur\b|\bdéveloppeur\b/, "Développeur"],
    [/\bdata\b/, "Alternant(e) data"],
    [/\bsupply\s*chain\b/, "Alternant(e) supply chain"],
    [/\bcomptab/, "Alternant(e) comptabilité"],
  ];

  for (const [pattern, label] of roleMap) {
    if (pattern.test(haystack)) {
      return `${label} — ${suffix}`.slice(0, 200);
    }
  }

  return title;
}

function canonicalizeLocation(location: string | null, raw?: string) {
  if (!location) return extractLocationFromRaw(raw);
  const base = location.split(/[,—–-]/)[0]?.trim() ?? location;
  const canonical = LOCATION_CANONICAL[normalizeText(base)];
  if (canonical) {
    const siteMatch = (raw ?? "").match(/localisation\s*:\s*([^,\n]+),\s*([^\n]+)/i);
    if (siteMatch?.[2]?.trim()) {
      return `${canonical} — ${siteMatch[2].trim()}`.slice(0, 200);
    }
    return canonical;
  }
  return location;
}

function isCorporateBullet(line: string) {
  const normalized = normalizeText(line.replace(/^•\s*/, ""));
  if (CORPORATE_BULLET_PATTERNS.some((pattern) => pattern.test(normalized))) return true;
  if (/^(rigueur|curiosité|sens critique|esprit d'équipe)$/i.test(normalized)) return true;
  return false;
}

function sanitizeDescription(description: string) {
  const lines = description.replace(/\r/g, "").split("\n");
  const out: string[] = [];
  let section = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (out.at(-1) !== "") out.push("");
      continue;
    }

    if (/^infos cl[eé]s$/i.test(trimmed)) {
      section = "infos";
      out.push("Infos clés");
      continue;
    }
    if (/^missions?$/i.test(trimmed)) {
      section = "missions";
      out.push("Missions");
      continue;
    }
    if (/^profil$/i.test(trimmed)) {
      section = "profil";
      out.push("Profil");
      continue;
    }

    if (trimmed.startsWith("•") && section === "missions" && isCorporateBullet(trimmed)) {
      continue;
    }

    if (trimmed.startsWith("•") && section === "profil") {
      const body = trimmed.replace(/^•\s*/, "");
      if (/compétences comportementales/i.test(body)) continue;
      if (/^(rigueur|esprit d'équipe|curiosité|sens critique)/i.test(body)) continue;
    }

    out.push(trimmed);
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, 4000);
}

function normalizeDescriptionStructure(description: string) {
  let text = description.replace(/\r/g, "").trim();
  text = text.replace(/\n{3,}/g, "\n\n");

  const hasSections = /infos cl[eé]s/i.test(text) && /missions?/i.test(text) && /profil/i.test(text);
  if (hasSections) {
    return sanitizeDescription(
      text
      .replace(/^infos cl[eé]s\s*:?\s*/im, "Infos clés\n")
      .replace(/^missions?\s*:?\s*/im, "Missions\n")
      .replace(/^profil\s*:?\s*/im, "Profil\n"),
    );
  }

  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const bullets = lines
    .flatMap((line) => {
      if (/^(infos|missions?|profil)\b/i.test(line)) return [line];
      if (line.startsWith("•")) return [line];
      if (line.length > 20) return [`• ${line.replace(/^[-*]\s*/, "")}`];
      return [];
    })
    .slice(0, 16);

  if (bullets.length >= 4) {
    return sanitizeDescription(
      ["Infos clés", ...bullets.slice(0, 4), "", "Missions", ...bullets.slice(4, 9), "", "Profil", ...bullets.slice(9, 13)]
      .join("\n"),
    );
  }

  return sanitizeDescription(text);
}

export function finalizeExtractedOffer(
  parsed: Partial<OfferExtractModelOutput>,
  raw?: string,
): ExtractedOfferFields | null {
  if (!parsed.title?.trim() || !parsed.description?.trim()) return null;

  const contractHint = normalizeContractHint(parsed.contractHint);
  const company = cleanExtractedCompany(
    parsed.company ? String(parsed.company).trim() : null,
  );
  const title = improveGenericTitle(
    cleanExtractedTitle(String(parsed.title).trim(), company, contractHint),
    contractHint,
    raw,
  );
  const parsedLocation = parsed.location ? cleanLocationCandidate(String(parsed.location)) : null;
  const location = canonicalizeLocation(
    (parsedLocation ?? extractLocationFromRaw(raw))?.slice(0, 200) ?? null,
    raw,
  );
  const description = normalizeDescriptionStructure(String(parsed.description).trim());

  return {
    title,
    company,
    location,
    description,
    contractHint,
  };
}
