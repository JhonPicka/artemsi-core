export const APP_NAME = "ARTEMSI";

export const STUDY_LEVELS = [
  "CAP_BEP",
  "BAC",
  "BAC_PLUS_1",
  "BAC_PLUS_2",
  "BAC_PLUS_3",
  "BAC_PLUS_4",
  "BAC_PLUS_5",
  "BAC_PLUS_4_5",
  "AUTRE",
] as const;

export type StudyLevel = (typeof STUDY_LEVELS)[number];

export const STUDY_LEVEL_LABEL: Record<StudyLevel, string> = {
  CAP_BEP: "CAP / BEP",
  BAC: "Bac",
  BAC_PLUS_1: "Bac +1",
  BAC_PLUS_2: "Bac +2",
  BAC_PLUS_3: "Bac +3",
  BAC_PLUS_4: "Bac +4",
  BAC_PLUS_5: "Bac +5",
  BAC_PLUS_4_5: "Bac +4 / +5",
  AUTRE: "Autre",
};

/** Niveaux affichés dans les formulaires (on cache la valeur composite legacy). */
export const STUDY_LEVEL_OPTIONS: StudyLevel[] = [
  "CAP_BEP",
  "BAC",
  "BAC_PLUS_1",
  "BAC_PLUS_2",
  "BAC_PLUS_3",
  "BAC_PLUS_4",
  "BAC_PLUS_5",
  "AUTRE",
];

export const CONTRACT_TYPES = ["ALTERNANCE", "APPRENTISSAGE", "PRO", "AUTRE"] as const;

export type ContractType = (typeof CONTRACT_TYPES)[number];

export const CONTRACT_TYPE_LABEL: Record<ContractType, string> = {
  ALTERNANCE: "Alternance",
  APPRENTISSAGE: "Apprentissage",
  PRO: "Contrat pro",
  AUTRE: "Autre",
};

export const CONTRACT_DURATIONS = [
  "3_MONTHS",
  "6_MONTHS",
  "12_MONTHS",
  "24_MONTHS",
  "36_MONTHS",
] as const;

export type ContractDuration = (typeof CONTRACT_DURATIONS)[number];

export const CONTRACT_DURATION_LABEL: Record<ContractDuration, string> = {
  "3_MONTHS": "3 mois",
  "6_MONTHS": "6 mois",
  "12_MONTHS": "1 an",
  "24_MONTHS": "2 ans",
  "36_MONTHS": "3 ans",
};

export const STUDY_DOMAINS = [
  "INFORMATIQUE",
  "MARKETING",
  "COMMERCE",
  "FINANCE",
  "RH",
  "INGENIERIE",
  "DESIGN",
  "COMMUNICATION",
  "DROIT",
  "SANTE",
  "INDUSTRIE",
  "LOGISTIQUE",
  "AUTRE",
] as const;

export type StudyDomain = (typeof STUDY_DOMAINS)[number];

export const STUDY_DOMAIN_LABEL: Record<StudyDomain, string> = {
  INFORMATIQUE: "Informatique / Tech",
  MARKETING: "Marketing",
  COMMERCE: "Commerce / Vente",
  FINANCE: "Finance / Comptabilité",
  RH: "Ressources humaines",
  INGENIERIE: "Ingénierie",
  DESIGN: "Design / UX",
  COMMUNICATION: "Communication",
  DROIT: "Droit",
  SANTE: "Santé",
  INDUSTRIE: "Industrie",
  LOGISTIQUE: "Logistique",
  AUTRE: "Autre",
};

export const REGIONS = [
  "Ile-de-France",
  "Auvergne-Rhone-Alpes",
  "Hauts-de-France",
  "Grand-Est",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays-de-la-Loire",
  "Bretagne",
  "Normandie",
  "Bourgogne-Franche-Comte",
  "Centre-Val-de-Loire",
  "Provence-Alpes-Cote-d'Azur",
  "Corse",
  "DOM-TOM",
] as const;

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

export const SUPPORTED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
] as const;
