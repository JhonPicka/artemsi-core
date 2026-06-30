/** Centroïde approximatif par région (profil candidat → requête LBA). */
export const REGION_GEOPOINTS: Record<string, { latitude: number; longitude: number }> = {
  "Ile-de-France": { latitude: 48.8566, longitude: 2.3522 },
  "Auvergne-Rhone-Alpes": { latitude: 45.764, longitude: 4.8357 },
  "Hauts-de-France": { latitude: 50.6292, longitude: 3.0573 },
  "Grand-Est": { latitude: 48.5734, longitude: 7.7521 },
  "Nouvelle-Aquitaine": { latitude: 44.8378, longitude: -0.5792 },
  Occitanie: { latitude: 43.6047, longitude: 1.4442 },
  "Pays-de-la-Loire": { latitude: 47.2184, longitude: -1.5536 },
  Bretagne: { latitude: 48.1173, longitude: -1.6778 },
  Normandie: { latitude: 49.1829, longitude: -0.3707 },
  "Bourgogne-Franche-Comte": { latitude: 47.322, longitude: 5.0415 },
  "Centre-Val-de-Loire": { latitude: 47.9029, longitude: 1.9093 },
  "Provence-Alpes-Cote-d'Azur": { latitude: 43.2965, longitude: 5.3698 },
  Corse: { latitude: 41.9192, longitude: 8.7386 },
  "DOM-TOM": { latitude: 14.6415, longitude: -61.0242 },
};

export function normalizeRegionKey(region: string): string {
  return region
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getRegionGeopoint(region: string): { latitude: number; longitude: number } | null {
  const direct = REGION_GEOPOINTS[region];
  if (direct) return direct;

  const norm = normalizeRegionKey(region);
  for (const [key, point] of Object.entries(REGION_GEOPOINTS)) {
    if (normalizeRegionKey(key) === norm) return point;
  }
  return null;
}
