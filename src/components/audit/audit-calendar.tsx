"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { AuditDay } from "@/lib/audit-slots";

type Props = {
  days: AuditDay[];
};

const WEEKDAY_HEADERS = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];

function parseYMDLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function localMidnightToDateISO(d: Date): string {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}

function startOfWeekMondayLocal(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const wd = x.getDay();
  const diff = wd === 0 ? -6 : 1 - wd;
  x.setDate(x.getDate() + diff);
  return x;
}

function endOfWeekSundayLocal(d: Date): Date {
  const mon = startOfWeekMondayLocal(d);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return sun;
}

function enumerateDaysInclusive(from: Date, to: Date): Date[] {
  const out: Date[] = [];
  const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 0, 0, 0, 0);
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 0, 0, 0, 0);
  while (cur.getTime() <= end.getTime()) {
    out.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function chunkWeeks(dates: Date[]): Date[][] {
  const weeks: Date[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }
  return weeks;
}

function buildCalendarWeeks(days: AuditDay[]): Date[][] {
  if (days.length === 0) return [];
  const sorted = [...days].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const first = parseYMDLocal(sorted[0].dateISO);
  const last = parseYMDLocal(sorted[sorted.length - 1].dateISO);
  const gridStart = startOfWeekMondayLocal(first);
  const gridEnd = endOfWeekSundayLocal(last);
  const flat = enumerateDaysInclusive(gridStart, gridEnd);
  return chunkWeeks(flat);
}

export function AuditCalendar({ days }: Props) {
  const router = useRouter();
  const [selectedDateISO, setSelectedDateISO] = useState<string | null>(() => days[0]?.dateISO ?? null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const byISO = useMemo(() => new Map(days.map((d) => [d.dateISO, d])), [days]);

  const weeks = useMemo(() => buildCalendarWeeks(days), [days]);

  const monthTitle = useMemo(() => {
    const iso = selectedDateISO ?? days[0]?.dateISO;
    if (!iso) return "";
    return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(
      parseYMDLocal(iso),
    );
  }, [days, selectedDateISO]);

  const selectedDay = useMemo(
    () => (selectedDateISO ? byISO.get(selectedDateISO) ?? null : null),
    [byISO, selectedDateISO],
  );

  const selectedSlotLabel = useMemo(() => {
    if (!selectedSlot) return null;
    for (const day of days) {
      const slot = day.slots.find((s) => s.startISO === selectedSlot);
      if (slot) {
        return `${day.dateLabel} — ${slot.label}`;
      }
    }
    return null;
  }, [days, selectedSlot]);

  function selectDate(iso: string) {
    const day = byISO.get(iso);
    if (!day || day.slots.length === 0) return;
    setSelectedDateISO(iso);
    setSelectedSlot((current) => {
      if (!current) return null;
      return day.slots.some((s) => s.startISO === current) ? current : null;
    });
  }

  async function submit() {
    if (!selectedSlot) {
      setError("Choisis un créneau d'abord.");
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const response = await fetch("/api/audit/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotStart: selectedSlot, notes }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Erreur réservation");
      }
      setSuccess("Réservation envoyée. Tu recevras une notification après validation.");
      setSelectedSlot(null);
      setNotes("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  if (days.length === 0) {
    return <p className="muted">Aucun créneau disponible cette semaine.</p>;
  }

  return (
    <div className="audit-calendar">
      <div className="audit-cal-layout">
        <div className="audit-cal-pane audit-cal-pane--calendar">
          <p className="audit-cal-month-title">{monthTitle}</p>
          <div className="audit-cal-weekdays" aria-hidden="true">
            {WEEKDAY_HEADERS.map((label) => (
              <span key={label} className="audit-cal-dow">
                {label}
              </span>
            ))}
          </div>
          <div className="audit-cal-weeks">
            {weeks.map((week, wi) => (
              <div key={wi} className="audit-cal-week">
                {week.map((cellDate) => {
                  const iso = localMidnightToDateISO(cellDate);
                  const day = byISO.get(iso);
                  const hasSlots = Boolean(day && day.slots.length > 0);
                  const isSelected = selectedDateISO === iso;
                  const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;

                  if (!hasSlots) {
                    return (
                      <div
                        key={iso}
                        className={`audit-cal-cell audit-cal-cell--empty${isWeekend ? " audit-cal-cell--weekend" : ""}`}
                      >
                        <span className="audit-cal-cell-num">{cellDate.getDate()}</span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={iso}
                      type="button"
                      className={`audit-cal-cell audit-cal-cell--day${isSelected ? " is-selected" : ""}${isWeekend ? " audit-cal-cell--weekend" : ""}${day?.isWeekend ? " is-slot-weekend" : ""}`}
                      onClick={() => selectDate(iso)}
                      aria-pressed={isSelected}
                      aria-label={`${day?.dateLabel ?? iso}, ${day?.slots.length} créneaux`}
                    >
                      <span className="audit-cal-cell-num">{cellDate.getDate()}</span>
                      {day?.isWeekend ? (
                        <span className="audit-cal-cell-tag">we</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="audit-cal-pane audit-cal-pane--side">
          <h4 className="audit-cal-side-heading">Créneaux</h4>
          {selectedDay ? (
            <>
              <p className="muted audit-cal-side-date">{selectedDay.dateLabel}</p>
              <div className="audit-slot-row audit-cal-slot-row">
                {selectedDay.slots.map((slot) => {
                  const isActive = selectedSlot === slot.startISO;
                  return (
                    <button
                      key={slot.startISO}
                      type="button"
                      onClick={() => setSelectedSlot(slot.startISO)}
                      className={`audit-slot ${isActive ? "active" : ""}`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="muted">Choisis un jour dans le calendrier.</p>
          )}

          <label className="audit-cal-notes-label" htmlFor="auditNotes">
            Note <span className="muted">(optionnelle)</span>
          </label>
          <textarea
            id="auditNotes"
            className="audit-cal-textarea"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Ex. focus sur la lettre, ton de voix, structure du CV…"
            rows={4}
            maxLength={500}
          />

          {selectedSlotLabel ? (
            <p className="muted audit-cal-recap">
              Sélection : <strong>{selectedSlotLabel}</strong>
            </p>
          ) : (
            <p className="muted audit-cal-recap">Puis valide avec le bouton ci-dessous.</p>
          )}
        </div>
      </div>

      <div className="audit-cal-footer">
        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">{success}</p> : null}
        <button type="button" onClick={submit} disabled={loading || !selectedSlot}>
          {loading ? "Envoi…" : "Demander cet audit"}
        </button>
      </div>
    </div>
  );
}
