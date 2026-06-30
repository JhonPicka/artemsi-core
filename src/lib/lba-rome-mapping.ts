import type { StudyDomain } from "@/lib/constants";

/**
 * Codes ROME (France Travail) par domaine d'étude profil.
 * Source : correspondances indicatives pour la recherche LBA.
 */
export const STUDY_DOMAIN_ROME_CODES: Record<StudyDomain, string[]> = {
  INFORMATIQUE: ["M1805", "M1806", "M1802", "M1810"],
  MARKETING: ["M1705", "M1707", "M1703"],
  COMMERCE: ["D1407", "D1406", "D1401"],
  FINANCE: ["M1203", "M1204", "M1206"],
  RH: ["M1501", "M1502", "M1503"],
  INGENIERIE: ["H1206", "F1106", "F1602", "F1604", "H2502"],
  DESIGN: ["E1401", "H1203", "H1206"],
  COMMUNICATION: ["E1103", "E1104", "E1106"],
  DROIT: ["M1204", "M1302", "M1402"],
  SANTE: ["J1306", "J1506", "J1406"],
  INDUSTRIE: ["H1206", "F1602", "F1604", "H1502", "H1402"],
  LOGISTIQUE: ["N1101", "N1103", "N1105", "M1602"],
  AUTRE: ["M1805", "D1407", "H1206"],
};

const ROME_TO_STUDY_DOMAIN = new Map<string, StudyDomain>();

for (const [domain, romes] of Object.entries(STUDY_DOMAIN_ROME_CODES) as [
  StudyDomain,
  string[],
][]) {
  for (const rome of romes) {
    if (!ROME_TO_STUDY_DOMAIN.has(rome)) {
      ROME_TO_STUDY_DOMAIN.set(rome, domain);
    }
  }
}

export function romeCodesForStudyDomain(studyDomain: string | null | undefined): string[] {
  if (!studyDomain) return STUDY_DOMAIN_ROME_CODES.AUTRE;
  const codes = STUDY_DOMAIN_ROME_CODES[studyDomain as StudyDomain];
  return codes?.length ? codes : STUDY_DOMAIN_ROME_CODES.AUTRE;
}

export function inferStudyDomainFromRomeCodes(romeCodes: string[]): string | null {
  for (const code of romeCodes) {
    const domain = ROME_TO_STUDY_DOMAIN.get(code.toUpperCase());
    if (domain) return domain;
  }
  return null;
}
