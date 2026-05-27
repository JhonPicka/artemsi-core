/**
 * Dates calendaires en Europe/Paris et affichage français (sans ambiguïté UTC pour AAAA-MM-JJ).
 */

export function normalizeToYyyyMmDd(value: string): string {
  return value.trim().slice(0, 10);
}

export function isValidYyyyMmDdDate(yyyyMmDd: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

/** Jour civil actuel à Paris, au format AAAA-MM-JJ (pour champs date et Postgres `date`). */
export function getTodayYyyyMmDdParis(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
}

/** Affiche une date AAAA-MM-JJ en français (ex. « mardi 28 avril 2026 »). */
export function formatFrenchLongDate(yyyyMmDd: string): string {
  const normalized = normalizeToYyyyMmDd(yyyyMmDd);
  if (!isValidYyyyMmDdDate(normalized)) {
    return yyyyMmDd;
  }
  const [y, mo, d] = normalized.split("-").map(Number);
  const utc = new Date(Date.UTC(y, mo - 1, d));
  return utc.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
