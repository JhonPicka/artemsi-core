export type MatchableProfile = {
  id: string;
  target_job: string | null;
  regions: string[] | null;
  contract_type: string | null;
  study_domain: string | null;
  /** Mots-cles issus des offres marquees « Ca m'interesse » sur le jobboard. */
  interest_keywords?: string[] | null;
};

export type MatchableOffer = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  summary: string;
  study_domain: string | null;
  is_partner_exclusive?: boolean;
};

export const REGION_HINTS: Record<string, string[]> = {
  "ile-de-france": ["paris", "la defense", "creteil", "versailles", "saint-denis", "idf"],
  "auvergne-rhone-alpes": ["lyon", "grenoble", "annecy", "clermont", "villeurbanne"],
  "hauts-de-france": ["lille", "amiens", "roubaix", "tourcoing", "arras"],
  "grand-est": ["strasbourg", "nancy", "metz", "reims", "mulhouse"],
  "nouvelle-aquitaine": ["bordeaux", "poitiers", "limoges", "pau", "bayonne", "biarritz"],
  occitanie: ["toulouse", "montpellier", "nimes", "perpignan"],
  "pays-de-la-loire": ["nantes", "angers", "le mans", "saint-nazaire"],
  bretagne: ["rennes", "brest", "lorient", "saint-brieuc", "vannes"],
  normandie: ["rouen", "caen", "le havre", "cherbourg"],
  "bourgogne-franche-comte": ["dijon", "besancon", "auxerre"],
  "centre-val-de-loire": ["orleans", "tours", "blois", "bourges"],
  "provence-alpes-cote-d'azur": ["marseille", "nice", "toulon", "aix", "cannes", "paca"],
  corse: ["ajaccio", "bastia", "corse"],
  "dom-tom": ["guadeloupe", "martinique", "guyane", "reunion", "mayotte", "polynesie"],
};

export const DOMAIN_HINTS: Record<string, string[]> = {
  INFORMATIQUE: ["developpeur", "developer", "data", "devops", "informatique", "cyber", "software"],
  MARKETING: ["marketing", "growth", "seo", "sea", "acquisition", "brand"],
  COMMERCE: ["commercial", "vente", "business developer", "account manager", "prospection"],
  FINANCE: ["finance", "comptabilite", "controle de gestion", "audit", "banque"],
  RH: ["rh", "ressources humaines", "recrutement", "talent", "paie"],
  INGENIERIE: ["ingenieur", "ingenierie", "mecanique", "electrique", "electronique", "production"],
  DESIGN: ["design", "ux", "ui", "graphique", "product designer"],
  COMMUNICATION: ["communication", "relations presse", "community manager", "contenu"],
  DROIT: ["juriste", "droit", "compliance", "legal"],
  SANTE: ["sante", "medical", "pharma", "clinique", "hopital"],
  INDUSTRIE: ["industrie", "usine", "maintenance", "qualite"],
  LOGISTIQUE: ["logistique", "supply chain", "transport", "approvisionnement"],
};

/** Seuil de score pour assigner une offre (jobboard / manuelle) a un profil. */
export const OFFER_MATCH_SCORE_THRESHOLD = 3;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function offerHaystack(offer: MatchableOffer) {
  return `${offer.title} ${offer.company ?? ""} ${offer.location ?? ""} ${offer.summary}`;
}

function hasRegionMatch(profileRegions: string[] | null, haystack: string) {
  if (!profileRegions || profileRegions.length === 0) return true;
  const normText = normalize(haystack);
  for (const region of profileRegions) {
    const key = normalize(region);
    const hints = REGION_HINTS[key] ?? [];
    if (normText.includes(key)) return true;
    if (hints.some((h) => normText.includes(normalize(h)))) return true;
  }
  return false;
}

function contractScore(contractType: string | null, haystack: string) {
  if (!contractType) return 0;
  const text = normalize(haystack);
  if (contractType === "ALTERNANCE") {
    return text.includes("alternance") ? 2 : 0;
  }
  if (contractType === "APPRENTISSAGE") {
    return text.includes("apprentissage") || text.includes("apprenti") ? 2 : 0;
  }
  if (contractType === "PRO") {
    return text.includes("contrat pro") || text.includes("professionnalisation") ? 2 : 0;
  }
  return 0;
}

function domainScore(
  studyDomain: string | null,
  offer: MatchableOffer,
  haystack: string,
) {
  const offerDomain = offer.study_domain;
  if (offerDomain) {
    if (!profileOfferDomainCompatible(studyDomain, offerDomain)) return 0;
    if (
      studyDomain &&
      studyDomain !== "AUTRE" &&
      offerDomain !== "AUTRE" &&
      studyDomain === offerDomain
    ) {
      return 3;
    }
    return 1;
  }

  if (!studyDomain || studyDomain === "AUTRE") return 0;
  const hints = DOMAIN_HINTS[studyDomain] ?? [];
  const text = normalize(haystack);
  return hints.some((h) => text.includes(normalize(h))) ? 1 : 0;
}

/** Filtre dur quand l'offre a un tag domaine explicite. */
export function profileOfferDomainCompatible(
  profileDomain: string | null,
  offerDomain: string | null,
) {
  if (!offerDomain) return true;
  if (!profileDomain || profileDomain === "AUTRE") return true;
  if (offerDomain === "AUTRE") return true;
  return profileDomain === offerDomain;
}

function interestScore(keywords: string[] | null | undefined, haystack: string) {
  if (!keywords?.length) return 0;
  const text = normalize(haystack);
  let score = 0;
  for (const kw of keywords) {
    const n = normalize(kw);
    if (n.length >= 3 && text.includes(n)) score += 1;
  }
  return Math.min(score, 4);
}

function jobScore(targetJob: string | null, haystack: string) {
  if (!targetJob) return 0;
  const text = normalize(haystack);
  const tokens = normalize(targetJob)
    .split(/\s+/)
    .filter((t) => t.length >= 3);
  if (tokens.length === 0) return 0;
  let score = 0;
  for (const token of tokens) {
    if (text.includes(token)) score += 2;
  }
  return Math.min(score, 8);
}

export function computeOfferMatchScore(profile: MatchableProfile, offer: MatchableOffer) {
  const haystack = offerHaystack(offer);
  if (!hasRegionMatch(profile.regions, haystack)) return 0;
  if (!profileOfferDomainCompatible(profile.study_domain, offer.study_domain)) return 0;
  return (
    jobScore(profile.target_job, haystack) +
    contractScore(profile.contract_type, haystack) +
    domainScore(profile.study_domain, offer, haystack) +
    interestScore(profile.interest_keywords, haystack)
  );
}

export function profileMatchesOffer(profile: MatchableProfile, offer: MatchableOffer) {
  const haystack = offerHaystack(offer);
  if (!hasRegionMatch(profile.regions, haystack)) return false;
  if (!profileOfferDomainCompatible(profile.study_domain, offer.study_domain)) return false;

  const score = computeOfferMatchScore(profile, offer);
  if (score >= OFFER_MATCH_SCORE_THRESHOLD) return true;

  const keywords = profile.interest_keywords ?? [];
  if (keywords.length >= 2 && interestScore(keywords, haystack) >= 2) {
    return true;
  }

  return false;
}

export function buildProfileOfferPairs(
  profiles: MatchableProfile[],
  offers: MatchableOffer[],
): { user_id: string; offer_id: string }[] {
  const pairs: { user_id: string; offer_id: string }[] = [];
  const seen = new Set<string>();

  for (const offer of offers) {
    for (const profile of profiles) {
      if (!profileMatchesOffer(profile, offer)) continue;
      const key = `${profile.id}:${offer.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({ user_id: profile.id, offer_id: offer.id });
    }
  }

  return pairs;
}
