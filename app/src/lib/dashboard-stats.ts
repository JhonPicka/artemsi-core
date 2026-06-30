import { normalizeToYyyyMmDd } from "@/lib/dates-fr";

export type OfferAssignmentRow = { assigned_at: string; status: string };

export type ApplicationRow = { status: string; applied_at: string };

/**
 * YYYY-MM-DD in Europe/Paris for a given instant.
 */
export function dateKeyParis(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
}

export function getLastNDayKeysParis(n: number): string[] {
  const keys: string[] = [];
  const step = 24 * 60 * 60 * 1000;
  const now = Date.now();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now - i * step);
    keys.push(
      d.toLocaleDateString("en-CA", { timeZone: "Europe/Paris" }),
    );
  }
  return keys;
}

export type DailyCount = { day: string; label: string; count: number };

export type ApplicationChartRow = {
  applied_at: string;
  status: string;
  updated_at: string;
};

export type DailyApplicationPoint = {
  day: string;
  label: string;
  sent: number;
  responses: number;
};

const APPLICATION_RESPONSE_STATUSES = new Set([
  "interview",
  "accepted",
  "rejected",
]);

/** Jours du mois calendaire en cours (Europe/Paris), du 1er à aujourd'hui. */
export function getCurrentMonthDayKeysParis(): string[] {
  const todayKey = dateKeyParis(new Date().toISOString());
  const [y, m] = todayKey.split("-").map(Number);
  if (!y || !m) return [todayKey];

  const keys: string[] = [];
  for (let d = 1; d <= 31; d++) {
    const day = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const check = new Date(`${day}T12:00:00Z`);
    if (dateKeyParis(check.toISOString()) !== day) continue;
    if (day > todayKey) break;
    keys.push(day);
  }
  return keys.length > 0 ? keys : [todayKey];
}

export function getCurrentMonthLabelParis(): string {
  const todayKey = dateKeyParis(new Date().toISOString());
  const [y, m] = todayKey.split("-").map(Number);
  if (!y || !m) return todayKey;
  const label = new Date(`${todayKey}T12:00:00Z`).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function buildApplicationMonthSeries(
  rows: ApplicationChartRow[],
): DailyApplicationPoint[] {
  const keys = getCurrentMonthDayKeysParis();
  const sent = new Map<string, number>();
  const responses = new Map<string, number>();

  for (const row of rows) {
    const appliedKey = normalizeToYyyyMmDd(row.applied_at);
    if (keys.includes(appliedKey)) {
      sent.set(appliedKey, (sent.get(appliedKey) ?? 0) + 1);
    }

    if (APPLICATION_RESPONSE_STATUSES.has(row.status)) {
      const responseKey = dateKeyParis(row.updated_at);
      if (keys.includes(responseKey)) {
        responses.set(responseKey, (responses.get(responseKey) ?? 0) + 1);
      }
    }
  }

  return keys.map((day) => ({
    day,
    label: formatShortFrLabel(day),
    sent: sent.get(day) ?? 0,
    responses: responses.get(day) ?? 0,
  }));
}

function demoApplicationMonthCounts(length: number): { sent: number; responses: number }[] {
  return Array.from({ length }, (_, i) => {
    const t = length > 1 ? i / (length - 1) : 0;
    const sent = Math.round(
      1.1 + 2.1 * Math.sin(t * Math.PI * 1.25) + 0.7 * Math.sin(t * Math.PI * 2.8),
    );
    const responses = Math.round(
      Math.max(0, 0.35 + 1.25 * Math.sin(t * Math.PI * 1.05 - 0.35)),
    );
    return {
      sent: Math.min(5, Math.max(0, sent)),
      responses: Math.min(4, Math.max(0, responses)),
    };
  });
}

/**
 * Motif fictif pour le graphique candidatures lorsqu'il n'y a pas encore de données réelles.
 */
export function buildApplicationChartSeriesWithFakeOverlay(
  real: DailyApplicationPoint[],
): DailyApplicationPoint[] {
  const demo = demoApplicationMonthCounts(real.length);
  return real.map((d, i) => ({
    ...d,
    sent: d.sent + (demo[i]?.sent ?? 0),
    responses: d.responses + (demo[i]?.responses ?? 0),
  }));
}

export function buildAssignmentDailySeries(
  assignments: OfferAssignmentRow[],
  days: number,
): DailyCount[] {
  const keys = getLastNDayKeysParis(days);
  const counts = new Map<string, number>();
  for (const row of assignments) {
    const k = dateKeyParis(row.assigned_at);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return keys.map((day) => ({
    day,
    label: formatShortFrLabel(day),
    count: counts.get(day) ?? 0,
  }));
}

/** Pattern of fake daily assignment counts for chart preview (visual only, 0–4). */
function demoAssignmentCounts(length: number): number[] {
  const wave = [0, 1, 0, 2, 1, 3, 2, 0, 1, 2, 4, 1, 2, 3, 2, 1, 0, 2, 3, 1];
  return Array.from({ length }, (_, i) => wave[i % wave.length] ?? 0);
}

const CHART_FAKE_CAP = 5;

/**
 * Série affichée uniquement sur le graphique : ajoute un motif fictif jour par jour
 * (plafonné à CHART_FAKE_CAP) pour des barres lisibles. Les totaux / table restent sur `real`.
 */
export function buildAssignmentChartSeriesWithFakeOverlay(real: DailyCount[]): DailyCount[] {
  const demo = demoAssignmentCounts(real.length);
  return real.map((d, i) => ({
    ...d,
    count: Math.min(CHART_FAKE_CAP, d.count + (demo[i] ?? 0)),
  }));
}

const MONTHS_FR = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

function formatShortFrLabel(yyyyMmDd: string): string {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  if (!y || !m || !d) return yyyyMmDd;
  return `${d} ${MONTHS_FR[m - 1] ?? ""}`.trim();
}

export function countByOfferAssignmentStatus(
  rows: { status: string }[],
): Record<string, number> {
  const out: Record<string, number> = {
    sent: 0,
    seen: 0,
    applied: 0,
    archived: 0,
  };
  for (const r of rows) {
    const k = r.status;
    if (k in out) {
      out[k] += 1;
    }
  }
  return out;
}

export function countByApplicationStatus(rows: { status: string }[]): {
  sent: number;
  interview: number;
  accepted: number;
  rejected: number;
  archived: number;
} {
  const out = {
    sent: 0,
    interview: 0,
    accepted: 0,
    rejected: 0,
    archived: 0,
  };
  for (const r of rows) {
    if (r.status in out) {
      out[r.status as keyof typeof out] += 1;
    }
  }
  return out;
}

export function countApplicationsInLastNDays(
  rows: { applied_at: string }[],
  n: number,
): number {
  const keys = new Set(getLastNDayKeysParis(n));
  let t = 0;
  for (const r of rows) {
    const day = normalizeToYyyyMmDd(r.applied_at);
    if (keys.has(day)) {
      t += 1;
    }
  }
  return t;
}

export function countAssignmentsInLastNDays(
  rows: { assigned_at: string }[],
  n: number,
): number {
  const keys = new Set(getLastNDayKeysParis(n));
  let t = 0;
  for (const r of rows) {
    const day = normalizeToYyyyMmDd(r.assigned_at);
    if (keys.has(day)) {
      t += 1;
    }
  }
  return t;
}

export type Momentum = {
  current: number;
  previous: number;
  delta: number;
  tone: "up" | "flat" | "down";
  label: string;
};

/**
 * Compare la fenêtre des 7 derniers jours à la semaine précédente
 * (jours 8 à 14 en arrière). Renvoie un libellé prêt à afficher.
 */
export function buildApplicationsMomentum(
  rows: { applied_at: string }[],
): Momentum {
  const last7 = getLastNDayKeysParis(7);
  const last14 = getLastNDayKeysParis(14);
  const previousKeys = new Set(last14.filter((k) => !last7.includes(k)));
  const currentKeys = new Set(last7);

  let current = 0;
  let previous = 0;
  for (const r of rows) {
    const day = normalizeToYyyyMmDd(r.applied_at);
    if (currentKeys.has(day)) current += 1;
    else if (previousKeys.has(day)) previous += 1;
  }

  const delta = current - previous;
  let tone: Momentum["tone"];
  let label: string;
  if (delta > 0) {
    tone = "up";
    label = `+${delta} candidature${delta > 1 ? "s" : ""} vs semaine passée`;
  } else if (delta < 0) {
    tone = "down";
    label = `${delta} candidature${delta < -1 ? "s" : ""} vs semaine passée`;
  } else {
    tone = "flat";
    label =
      current === 0
        ? "Aucune candidature cette semaine"
        : `${current} candidature${current > 1 ? "s" : ""}, comme la semaine passée`;
  }
  return { current, previous, delta, tone, label };
}

export type ActivationStep = {
  id: "profile" | "cv" | "application" | "audit";
  label: string;
  done: boolean;
  href: string;
};

export function buildActivationSteps(input: {
  onboardingCompleted: boolean;
  documentsCount: number;
  applicationsCount: number;
  upcomingAuditsCount: number;
}): { steps: ActivationStep[]; doneCount: number; total: number; percent: number } {
  const steps: ActivationStep[] = [
    {
      id: "profile",
      label: "Compléter ton profil",
      done: input.onboardingCompleted,
      href: "/dashboard/profil",
    },
    {
      id: "cv",
      label: "Téléverser ton CV",
      done: input.documentsCount > 0,
      href: "/dashboard/profil",
    },
    {
      id: "application",
      label: "Ajouter ta 1ère candidature",
      done: input.applicationsCount > 0,
      href: "/dashboard/candidatures",
    },
    {
      id: "audit",
      label: "Réserver ton audit CV / LM",
      done: input.upcomingAuditsCount > 0,
      href: "/dashboard/audit",
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const total = steps.length;
  const percent = Math.round((doneCount / total) * 100);
  return { steps, doneCount, total, percent };
}

export type DailyAction = {
  id: string;
  label: string;
  href: string;
};

export function buildTodayActions(input: {
  offersToRead: number;
  applicationsCount: number;
  upcomingAuditsCount: number;
  documentsCount: number;
  staleApplicationsCount: number;
}): DailyAction[] {
  const out: DailyAction[] = [];
  if (input.offersToRead > 0) {
    out.push({
      id: "offers",
      label:
        input.offersToRead === 1
          ? "Découvrir 1 nouvelle offre"
          : `Découvrir ${input.offersToRead} nouvelles offres`,
      href: "/dashboard/offres",
    });
  }
  if (input.documentsCount === 0) {
    out.push({
      id: "cv",
      label: "Téléverser ton CV pour activer les offres ciblées",
      href: "/dashboard/profil",
    });
  }
  if (input.upcomingAuditsCount === 0) {
    out.push({
      id: "audit",
      label: "Réserver un audit CV / lettre",
      href: "/dashboard/audit",
    });
  }
  if (input.staleApplicationsCount > 0) {
    out.push({
      id: "follow-up",
      label: `Relancer ${input.staleApplicationsCount} candidature${
        input.staleApplicationsCount > 1 ? "s" : ""
      } sans nouvelles`,
      href: "/dashboard/candidatures",
    });
  }
  if (input.applicationsCount === 0 && out.length < 3) {
    out.push({
      id: "first-app",
      label: "Ajouter ta première candidature",
      href: "/dashboard/candidatures",
    });
  }
  return out.slice(0, 3);
}

/**
 * Candidatures envoyées il y a > N jours et qui n'ont pas évolué (toujours "sent").
 */
export function countStaleSentApplications(
  rows: { status: string; applied_at: string }[],
  staleAfterDays = 10,
): number {
  const threshold = staleAfterDays * 24 * 60 * 60 * 1000;
  const now = Date.now();
  let count = 0;
  for (const r of rows) {
    if (r.status !== "sent") continue;
    const day = normalizeToYyyyMmDd(r.applied_at);
    const t = Date.parse(`${day}T00:00:00Z`);
    if (Number.isNaN(t)) continue;
    if (now - t > threshold) count += 1;
  }
  return count;
}
