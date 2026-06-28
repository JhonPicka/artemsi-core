import { PRO_AUDITS_PER_MONTH } from "@/lib/billing-offer";
import { getParisParts } from "@/lib/dates-fr";

export type AuditBookingMonthRow = {
  slot_start: string;
  status: string;
};

export function getParisYearMonth(instant: Date): string {
  const { year, month } = getParisParts(instant);
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function auditBookingCountsTowardMonthlyLimit(status: string): boolean {
  return status === "pending" || status === "confirmed";
}

export function countAuditBookingsForParisMonth(
  bookings: AuditBookingMonthRow[],
  monthKey: string,
): number {
  return bookings.filter(
    (booking) =>
      auditBookingCountsTowardMonthlyLimit(booking.status) &&
      getParisYearMonth(new Date(booking.slot_start)) === monthKey,
  ).length;
}

export function hasReachedMonthlyAuditLimit(
  bookings: AuditBookingMonthRow[],
  forInstant: Date,
): boolean {
  const monthKey = getParisYearMonth(forInstant);
  return countAuditBookingsForParisMonth(bookings, monthKey) >= PRO_AUDITS_PER_MONTH;
}

export function auditMonthlyLimitMessage(): string {
  return PRO_AUDITS_PER_MONTH === 1
    ? "Tu as déjà réservé ton audit du mois. Prochain créneau disponible le mois suivant."
    : `Tu as atteint la limite de ${PRO_AUDITS_PER_MONTH} audits pour ce mois.`;
}
