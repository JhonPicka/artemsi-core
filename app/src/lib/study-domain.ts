import { STUDY_DOMAINS, type StudyDomain } from "@/lib/constants";
import { DOMAIN_HINTS } from "@/lib/offer-matching";

const DOMAIN_ALIASES: Record<string, StudyDomain> = {
  informatique: "INFORMATIQUE",
  tech: "INFORMATIQUE",
  it: "INFORMATIQUE",
  marketing: "MARKETING",
  commerce: "COMMERCE",
  vente: "COMMERCE",
  finance: "FINANCE",
  comptabilite: "FINANCE",
  rh: "RH",
  ressources_humaines: "RH",
  ingenierie: "INGENIERIE",
  design: "DESIGN",
  ux: "DESIGN",
  communication: "COMMUNICATION",
  droit: "DROIT",
  sante: "SANTE",
  industrie: "INDUSTRIE",
  logistique: "LOGISTIQUE",
  autre: "AUTRE",
};

function normalizeKey(value: string) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** Valide et normalise un code domaine (profil / offre / CSV / extraction IA). */
export function normalizeStudyDomain(value: string | null | undefined): StudyDomain | null {
  if (!value?.trim()) return null;
  const upper = value.trim().toUpperCase();
  if ((STUDY_DOMAINS as readonly string[]).includes(upper)) {
    return upper as StudyDomain;
  }
  const alias = DOMAIN_ALIASES[normalizeKey(value)];
  return alias ?? null;
}

export function isStudyDomain(value: string | null | undefined): value is StudyDomain {
  return normalizeStudyDomain(value) !== null;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Devine le domaine à partir du titre / description (offres historiques sans tag). */
export function inferStudyDomainFromText(text: string): StudyDomain | null {
  const norm = normalizeText(text);
  if (!norm) return null;

  let best: StudyDomain | null = null;
  let bestHits = 0;

  for (const domain of STUDY_DOMAINS) {
    if (domain === "AUTRE") continue;
    const hints = DOMAIN_HINTS[domain] ?? [];
    const hits = hints.filter((hint) => norm.includes(normalizeText(hint))).length;
    if (hits > bestHits) {
      bestHits = hits;
      best = domain;
    }
  }

  return bestHits > 0 ? best : null;
}
