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

export const ALTERNANCE_RHYTHMS = [
  "ONE_WEEK_ONE_WEEK",
  "TWO_WEEKS_TWO_WEEKS",
  "THREE_WEEKS_ONE_WEEK",
  "AUTRE",
  "NOT_APPLICABLE",
] as const;

export type AlternanceRhythm = (typeof ALTERNANCE_RHYTHMS)[number];

export const ALTERNANCE_RHYTHM_LABEL: Record<AlternanceRhythm, string> = {
  ONE_WEEK_ONE_WEEK: "1 semaine / 1 semaine",
  TWO_WEEKS_TWO_WEEKS: "2 semaines / 2 semaines",
  THREE_WEEKS_ONE_WEEK: "3 semaines / 1 semaine",
  AUTRE: "Autre",
  NOT_APPLICABLE: "Non concerné",
};

/** Rythmes affichés dans le formulaire (hors « non concerné »). */
export const ALTERNANCE_RHYTHM_OPTIONS: AlternanceRhythm[] = [
  "ONE_WEEK_ONE_WEEK",
  "TWO_WEEKS_TWO_WEEKS",
  "THREE_WEEKS_ONE_WEEK",
  "AUTRE",
];

export const PREFERRED_SECTORS = [
  "AUTOMOBILE",
  "AERONAUTIQUE",
  "ENERGIE",
  "DEFENSE",
  "FERROVIAIRE",
  "LUXE",
  "INDUSTRIE",
] as const;

export type PreferredSector = (typeof PREFERRED_SECTORS)[number];

export const PREFERRED_SECTOR_LABEL: Record<PreferredSector, string> = {
  AUTOMOBILE: "Automobile",
  AERONAUTIQUE: "Aéronautique",
  ENERGIE: "Énergie",
  DEFENSE: "Défense",
  FERROVIAIRE: "Ferroviaire",
  LUXE: "Luxe",
  INDUSTRIE: "Industrie",
};

export const ACQUISITION_SOURCES = [
  "TIKTOK",
  "LINKEDIN",
  "INSTAGRAM",
  "BDE",
  "AMI",
  "ECOLE",
  "AUTRE",
] as const;

export type AcquisitionSource = (typeof ACQUISITION_SOURCES)[number];

export const ACQUISITION_SOURCE_LABEL: Record<AcquisitionSource, string> = {
  TIKTOK: "TikTok",
  LINKEDIN: "LinkedIn",
  INSTAGRAM: "Instagram",
  BDE: "BDE",
  AMI: "Ami",
  ECOLE: "École",
  AUTRE: "Autre",
};

export const APPLICATIONS_SENT_RANGES = [
  "RANGE_0_10",
  "RANGE_10_50",
  "RANGE_50_100",
  "RANGE_100_PLUS",
] as const;

export type ApplicationsSentRange = (typeof APPLICATIONS_SENT_RANGES)[number];

export const APPLICATIONS_SENT_RANGE_LABEL: Record<ApplicationsSentRange, string> = {
  RANGE_0_10: "0-10",
  RANGE_10_50: "10-50",
  RANGE_50_100: "50-100",
  RANGE_100_PLUS: "100+",
};

export const SEARCH_LEVELS = [
  "STARTING",
  "ACTIVE",
  "INTERVIEWS",
  "OFFER",
] as const;

export type SearchLevel = (typeof SEARCH_LEVELS)[number];

export const SEARCH_LEVEL_LABEL: Record<SearchLevel, string> = {
  STARTING: "Je commence",
  ACTIVE: "Je recherche activement",
  INTERVIEWS: "J'ai déjà des entretiens",
  OFFER: "J'ai une proposition",
};

export const ONBOARDING_STEP_LABELS = [
  "Identité",
  "Recherche",
  "Alternance & secteurs",
  "Ton parcours",
  "Documents",
] as const;

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
