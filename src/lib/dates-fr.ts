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

export const PARIS_TZ = "Europe/Paris" as const;

function pad2(value: number) {
  return value.toString().padStart(2, "0");
}

const PARIS_WEEKDAY: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** Composantes calendaires d'un instant en Europe/Paris. */
export function getParisParts(instant: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: PARIS_TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    weekday: "short",
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(instant)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    dayOfWeek: PARIS_WEEKDAY[parts.weekday] ?? 0,
  };
}

/** Jour civil (AAAA-MM-JJ) d'un instant en Europe/Paris. */
export function yyyyMmDdFromInstantParis(instant: Date): string {
  return instant.toLocaleDateString("en-CA", { timeZone: PARIS_TZ });
}

/** Date locale navigateur → AAAA-MM-JJ sans conversion UTC. */
export function yyyyMmDdFromLocalDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Ajoute des jours civils à une date AAAA-MM-JJ. */
export function addCalendarDays(yyyyMmDd: string, days: number): string {
  const [y, mo, d] = normalizeToYyyyMmDd(yyyyMmDd).split("-").map(Number);
  const shifted = new Date(Date.UTC(y, mo - 1, d + days, 12, 0, 0));
  return `${shifted.getUTCFullYear()}-${pad2(shifted.getUTCMonth() + 1)}-${pad2(shifted.getUTCDate())}`;
}

/** Heure locale Paris → instant UTC (gère CET/CEST). */
export function parisLocalToUTC(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
): Date {
  const local = `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:00`;
  for (const offset of ["+02:00", "+01:00"]) {
    const candidate = new Date(`${local}${offset}`);
    if (Number.isNaN(candidate.getTime())) {
      continue;
    }
    const parts = getParisParts(candidate);
    if (
      parts.year === year &&
      parts.month === month &&
      parts.day === day &&
      parts.hour === hour &&
      parts.minute === minute
    ) {
      return candidate;
    }
  }
  throw new Error(`Invalid Paris local time: ${local}`);
}

/** Valeur `datetime-local` (heure Paris) → ISO UTC. */
export function parisDatetimeLocalToISO(value: string): string {
  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) {
    throw new Error("Invalid datetime-local value");
  }
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute = 0] = timePart.split(":").map(Number);
  return parisLocalToUTC(year, month, day, hour, minute).toISOString();
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
