import {
  addCalendarDays,
  formatFrenchLongDate,
  getParisParts,
  getTodayYyyyMmDdParis,
  parisLocalToUTC,
} from "@/lib/dates-fr";

export type AuditSlot = {
  startISO: string;
  endISO: string;
  label: string;
};

export type AuditDay = {
  dateLabel: string;
  dateISO: string;
  isWeekend: boolean;
  slots: AuditSlot[];
};

const SLOT_DURATION_MINUTES = 60;

/** Créneaux de début (heure Paris) — audits d'1 h. */
export const AUDIT_WEEKDAY_HOURS = [10, 11, 12, 13, 14, 15, 16] as const;
export const AUDIT_WEEKEND_HOURS = [10, 11, 12, 13, 14] as const;

export const AUDIT_AVAILABILITY_LABEL =
  "semaine 10h-16h, week-end 10h-14h (heure Paris)";

const WEEKDAY_HOURS: readonly number[] = AUDIT_WEEKDAY_HOURS;
const WEEKEND_HOURS: readonly number[] = AUDIT_WEEKEND_HOURS;

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function formatTimeLabel(hour: number) {
  return `${pad(hour)}h00`;
}

function isPast(instant: Date, now: Date) {
  return instant.getTime() <= now.getTime();
}

function parisWeekdayFromYyyyMmDd(yyyyMmDd: string) {
  const [year, month, day] = yyyyMmDd.split("-").map(Number);
  return getParisParts(parisLocalToUTC(year, month, day, 12)).dayOfWeek;
}

export function generateAuditDays({
  daysAhead = 21,
  takenStarts,
  now = new Date(),
}: {
  daysAhead?: number;
  takenStarts: Set<string>;
  now?: Date;
}): AuditDay[] {
  const days: AuditDay[] = [];
  const todayParis = getTodayYyyyMmDdParis();

  for (let offset = 0; offset < daysAhead; offset += 1) {
    const dateISO = addCalendarDays(todayParis, offset);
    const [year, month, day] = dateISO.split("-").map(Number);
    const dayOfWeek = parisWeekdayFromYyyyMmDd(dateISO);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const hours = isWeekend ? WEEKEND_HOURS : WEEKDAY_HOURS;

    const slots: AuditSlot[] = [];
    for (const hour of hours) {
      const slotStart = parisLocalToUTC(year, month, day, hour);

      if (isPast(slotStart, now)) {
        continue;
      }

      const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION_MINUTES * 60_000);
      const startISO = slotStart.toISOString();
      if (takenStarts.has(startISO)) {
        continue;
      }

      slots.push({
        startISO,
        endISO: slotEnd.toISOString(),
        label: formatTimeLabel(hour),
      });
    }

    if (slots.length === 0) {
      continue;
    }

    days.push({
      dateLabel: formatFrenchLongDate(dateISO),
      dateISO,
      isWeekend,
      slots,
    });
  }

  return days;
}

export function isSlotAllowed(slotStartISO: string) {
  const start = new Date(slotStartISO);
  if (Number.isNaN(start.getTime())) {
    return false;
  }

  const parts = getParisParts(start);
  if (parts.minute !== 0 || parts.second !== 0) {
    return false;
  }

  const { dayOfWeek, hour } = parts;
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return WEEKEND_HOURS.includes(hour);
  }
  return WEEKDAY_HOURS.includes(hour);
}
