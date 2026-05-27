import { REGIONS, STUDY_DOMAINS, type StudyDomain } from "@/lib/constants";
import { DOMAIN_HINTS, REGION_HINTS } from "@/lib/offer-matching";

/** Réponse JSON attendue du modèle (champs internes optionnels pour le matching). */
export type OfferExtractModelOutput = {
  title: string;
  company: string | null;
  location: string | null;
  description: string;
  contractHint: "alternance" | "apprentissage" | "pro" | null;
  studyDomainHint?: StudyDomain | "AUTRE" | null;
  /** Villes / lieux à faire apparaître dans title, location ou description (matching régional). */
  locationKeywords?: string[];
  /** Mots du métier (synonymes inclus) pour le matching target_job. */
  jobKeywords?: string[];
  /** Mots-cles a integrer dans le CV et la lettre de motivation pour coller a l'offre. */
  resumeKeywords?: string[];
};

export type ExtractedOfferFields = {
  title: string;
  company: string | null;
  location: string | null;
  description: string;
  contractHint: string | null;
  /** Mots-cles CV/LM affiches au candidat (5 a 12 items). */
  resumeKeywords: string[];
};

const REGION_SLUGS = REGIONS.map((r) =>
  r
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/\s+/g, "-"),
);

const DOMAIN_LIST = STUDY_DOMAINS.join(" | ");

function buildRegionMatchingGuide() {
  const lines: string[] = [];
  for (const slug of REGION_SLUGS) {
    const hints = REGION_HINTS[slug] ?? [];
    const cities = hints.slice(0, 6).join(", ");
    if (cities) lines.push(`- ${slug} → villes utiles : ${cities}`);
  }
  return lines.join("\n");
}

function buildDomainMatchingGuide() {
  return STUDY_DOMAINS.filter((d) => d !== "AUTRE")
    .map((code) => {
      const hints = DOMAIN_HINTS[code] ?? [];
      return `- ${code} → mots-clés : ${hints.slice(0, 8).join(", ")}`;
    })
    .join("\n");
}

export const OFFER_EXTRACT_SYSTEM_PROMPT = `Tu es l'extracteur officiel ARTEMSI (plateforme alternance / apprentissage en France).
Ta mission : extraire les informations importantes d'une annonce brute pour créer un raccourci clair, rapide à lire, exploitable par un candidat ET par le matching automatique.

## Règles absolues
- Réponds UNIQUEMENT en JSON valide, sans markdown.
- N'invente JAMAIS : si une info manque, mets null ou une formulation neutre courte.
- Tu n'es PAS un copywriter : ne réécris pas toute l'annonce en version marketing.
- Tu dois EXTRAIRE, NETTOYER et STRUCTURER uniquement les infos utiles : poste, entreprise, lieu, contrat, missions, profil, rythme, durée, démarrage.
- Ne copie-colle pas l'annonce brute en entier. Ne garde pas les phrases RH génériques, les valeurs corporate, les longs paragraphes de présentation ou les mentions légales.
- La description doit être un RACCOURCI de l'offre : le candidat doit comprendre en moins de 30 secondes si ça vaut le coup de postuler.
- Français correct, ton professionnel, pas d'emojis.
- L'annonce concerne en priorité alternance, apprentissage ou contrat pro en France.

## JSON attendu
{
  "title": string,              // 5 à 90 caractères
  "company": string | null,
  "location": string | null,    // OBLIGATOIRE si une ville, adresse, code postal ou site est présent
  "description": string,        // 350 à 900 caractères, raccourci structuré
  "contractHint": "alternance" | "apprentissage" | "pro" | null,
  "studyDomainHint": ${DOMAIN_LIST} | null,
  "locationKeywords": string[], // 1 à 4 noms de villes/lieux réels (ex. "Lyon", "Paris")
  "jobKeywords": string[],      // 3 à 8 mots du métier (intitulé + synonymes)
  "resumeKeywords": string[]    // 5 à 12 mots-clés à intégrer dans le CV et la lettre de motivation
}

## title (affichage carte offre)
- Format idéal : « Métier — type » ex. « Développeur web — Alternance »
- Contient le métier principal en 2 à 6 mots (reprend l'intitulé exact de l'annonce si possible).
- Pas de nom d'entreprise dans le title (il va dans company).

## company
- Raison sociale nettoyée, sans « chez », sans URL.

## location
- Champ très important : cherche activement un lieu dans TOUT le texte avant de répondre.
- Détecte les signaux : "Lieu", "Localisation", "Adresse", "Site", "Poste basé à", "à pourvoir à", code postal + ville, arrondissement, campus, agence, bureau.
- Format attendu : « Lyon (69) », « Paris 13e », « Nantes », « Lille (hybride) » ou « France (remote) ».
- Si plusieurs lieux existent, mets le lieu principal du poste. Si hybride, garde la ville du bureau + « (hybride) ».
- Ne mets null que si aucun lieu, aucune ville, aucun code postal et aucun indice de remote n'apparaît.

## description (CRITIQUE pour affichage + matching)
Structure obligatoire en 3 blocs courts dans un seul texte :

1) « Infos clés » puis 3 à 5 puces max :
   • Lieu : ...
   • Contrat : ...
   • Rythme / durée / démarrage : ... si présent
   • Niveau / formation : ... si présent
   • Source : site carrières officiel / entreprise si évident

2) « Missions » puis 2 à 4 puces max :
   uniquement les missions concrètes, pas les phrases génériques.

3) « Profil » puis 2 à 3 puces max :
   formation, compétences, outils, niveau attendu.

Interdit dans description :
- long paragraphe d'introduction ;
- storytelling RH ;
- répétition de l'annonce brute ;
- phrases comme « rejoignez une entreprise leader », « environnement dynamique », sauf si c'est utile au poste.

Priorité : sortir les informations utiles au candidat. Si l'annonce contient un salaire, rythme, durée, date de début, niveau d'étude, outils, équipe, avantages importants, il faut les inclure. Si une information n'existe pas, ne l'invente pas. Maximum 12 puces au total.

Le texte DOIT contenir explicitement (intégrés naturellement, pas en liste séparée « tags ») :
- Le type de contrat : au moins un parmi « alternance », « apprentissage », « contrat pro », « professionnalisation » selon contractHint.
- Le nom de la ville principale (identique à location) au moins une fois, si trouvée.
- 3 à 6 mots-clés du domaine métier (voir studyDomainHint) — ex. pour l'informatique : développeur, data, logiciel…
- Les termes de jobKeywords répartis dans l'accroche ou les missions.

## contractHint
- "alternance" si alternance / alternant(e)
- "apprentissage" si apprentissage / apprenti(e) / CFA
- "pro" si contrat de professionnalisation uniquement
- null si vraiment indéterminé

## studyDomainHint
Choisis le code le plus proche parmi la liste. null seulement si impossible à déduire.

## locationKeywords & jobKeywords
- locationKeywords : villes réelles pour matcher les régions des candidats (voir guide ci-dessous).
- jobKeywords : tokens ≥ 3 lettres du métier (ex. « commercial », « marketing », « développeur »).

## resumeKeywords (CRUCIAL pour l'aide candidature)
Cette liste est affichée au candidat sous le titre « Mots-clés à intégrer dans ton CV et ta lettre de motivation ».
- 5 à 12 mots-clés concrets, en français, à reprendre directement par le candidat dans ses documents.
- Mix attendu : compétences techniques, outils cités, soft skills explicites, méthodologies, secteur d'activité, niveau d'études.
- Exemples valides : « Excel avancé », « gestion de projet », « anglais professionnel », « Adobe Photoshop », « relation client B2B », « Bac+4 », « SQL ».
- Interdits : phrases complètes, slogans marketing, valeurs corporate (« passion », « excellence »), mots vides (« travail », « équipe » sans contexte).
- Reprends fidèlement les termes de l'annonce quand ils existent.

## Guide matching régional (inclure ces villes dans description quand la région correspond)
${buildRegionMatchingGuide()}

## Guide matching domaine (mots à intégrer dans la description)
${buildDomainMatchingGuide()}

## Scoring interne ARTEMSI (ne pas mentionner au candidat)
Le moteur compare title + company + location + description au profil (métier cible, région, type de contrat, domaine d'études). Plus les mots ci-dessus sont présents et précis, meilleur est le matching.`;

export function buildOfferExtractUserMessage(url: string, raw: string) {
  return `URL source : ${url}

--- ANNONCE BRUTE ---
${raw.slice(0, 12_000)}
--- FIN ---

Extrais un raccourci ARTEMSI : infos importantes seulement, format court, pas de copier-coller.
Le candidat doit comprendre rapidement : où, quel contrat, quelles missions, quel profil, et comment retrouver l'offre officielle.
Si l'annonce est incomplète, reste factuel et court plutôt que d'inventer.`;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function haystackFrom(fields: Pick<ExtractedOfferFields, "title" | "company" | "location" | "description">) {
  return normalizeText(
    `${fields.title} ${fields.company ?? ""} ${fields.location ?? ""} ${fields.description}`,
  );
}

function containsKeyword(haystack: string, keyword: string) {
  const n = normalizeText(keyword);
  return n.length >= 3 && haystack.includes(n);
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
  "avantages",
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

const CONTRACT_PHRASES: Record<string, string> = {
  alternance: "Contrat en alternance.",
  apprentissage: "Contrat d'apprentissage.",
  pro: "Contrat de professionnalisation.",
};

function dedupeKeywords(values: (string | undefined | null)[], max = 12): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (!value) continue;
    const trimmed = String(value).trim();
    if (trimmed.length < 2 || trimmed.length > 60) continue;
    const key = normalizeText(trimmed);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Complète la description si des signaux de matching manquent encore
 * (filet de sécurité après réponse IA).
 */
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
  let description = String(parsed.description).trim();

  const fields = { title, company, location, description };
  let haystack = haystackFrom(fields);

  if (contractHint && CONTRACT_PHRASES[contractHint]) {
    const phrase = CONTRACT_PHRASES[contractHint].toLowerCase();
    if (!haystack.includes(normalizeText(contractHint)) && !haystack.includes(phrase.slice(0, 12))) {
      description = `${description}\n\n${CONTRACT_PHRASES[contractHint]}`;
      haystack = haystackFrom({ ...fields, description });
    }
  }

  const locationCity = location?.split(/[,(]/)[0]?.trim();
  const locationKeywords = Array.from(
    new Set([...(parsed.locationKeywords ?? []), locationCity].filter(Boolean)),
  );

  for (const city of locationKeywords) {
    if (city && !containsKeyword(haystack, city)) {
      description = `${description}\n\nLieu : ${city}.`;
      haystack = haystackFrom({ ...fields, description });
    }
  }

  if (location && !containsKeyword(haystack, location.split(/[,(]/)[0] ?? "")) {
    const city = location.split(/[,(]/)[0]?.trim();
    if (city && city.length >= 3) {
      description = `Basé à ${city}. ${description}`;
      haystack = haystackFrom({ ...fields, description });
    }
  }

  let addedJobKw = 0;
  for (const kw of parsed.jobKeywords ?? []) {
    if (addedJobKw >= 3) break;
    if (kw && !containsKeyword(haystack, kw)) {
      description = `${description} ${kw}.`;
      haystack = haystackFrom({ ...fields, description });
      addedJobKw += 1;
    }
  }

  const domain = parsed.studyDomainHint;
  if (domain && domain !== "AUTRE" && DOMAIN_HINTS[domain]) {
    const missing = DOMAIN_HINTS[domain].filter((h) => !containsKeyword(haystack, h));
    if (missing.length > 0) {
      const top = missing.slice(0, 3).join(", ");
      description = `${description}\n\nDomaine : ${top}.`;
    }
  }

  const resumeKeywords = dedupeKeywords([
    ...(parsed.resumeKeywords ?? []),
    ...(parsed.jobKeywords ?? []),
  ]);

  return {
    title,
    company,
    location,
    description: description.trim().slice(0, 4000),
    contractHint,
    resumeKeywords,
  };
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
