import { STUDY_DOMAINS, type StudyDomain } from "@/lib/constants";

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
