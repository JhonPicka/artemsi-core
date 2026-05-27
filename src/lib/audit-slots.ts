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

const WEEKDAY_HOURS = [18, 19, 20, 21];
const WEEKEND_HOURS = [10, 11, 12, 13];

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function formatTimeLabel(hour: number) {
  return `${pad(hour)}h00`;
}

function isPast(date: Date, now: Date) {
  return date.getTime() <= now.getTime();
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

  for (let offset = 0; offset < daysAhead; offset += 1) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() + offset);

    const dayOfWeek = day.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const hours = isWeekend ? WEEKEND_HOURS : WEEKDAY_HOURS;

    const slots: AuditSlot[] = [];
    for (const hour of hours) {
      const slotStart = new Date(day);
      slotStart.setHours(hour, 0, 0, 0);

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
      dateLabel: formatDateLabel(day),
      dateISO: day.toISOString().slice(0, 10),
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
  if (start.getMinutes() !== 0 || start.getSeconds() !== 0) {
    return false;
  }
  const dayOfWeek = start.getDay();
  const hour = start.getHours();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return WEEKEND_HOURS.includes(hour);
  }
  return WEEKDAY_HOURS.includes(hour);
}
