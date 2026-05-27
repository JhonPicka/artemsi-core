import { isSlotAllowed } from "@/lib/audit-slots";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuditBookingStatus = "pending" | "confirmed" | "declined" | "cancelled";

export type AdminAuditRow = {
  id: string;
  slotStart: string;
  slotEnd: string;
  status: AuditBookingStatus;
  userNotes: string | null;
  adminNotes: string | null;
  createdAt: string;
  userEmail: string;
  fullName: string | null;
  targetJob: string | null;
  phone: string | null;
};

export const AUDIT_STATUS_LABEL: Record<AuditBookingStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  declined: "Refusé",
  cancelled: "Annulé",
};

type BookingRow = {
  id: string;
  slot_start: string;
  slot_end: string;
  status: string;
  user_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  user_id: string;
};

const BOOKING_SELECT =
  "id, slot_start, slot_end, status, user_notes, admin_notes, created_at, user_id";

async function enrichAuditBookings(bookings: BookingRow[]): Promise<AdminAuditRow[]> {
  if (bookings.length === 0) return [];

  const supabase = createAdminClient();
  const userIds = [...new Set(bookings.map((b) => b.user_id))];
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email, full_name, target_job, phone")
    .in("id", userIds);

  if (profilesError) throw new Error(profilesError.message);

  const profileById = new Map((profiles ?? []).map((p) => [p.id as string, p]));

  return bookings.map((row) => {
    const profile = profileById.get(row.user_id);
    return {
      id: row.id,
      slotStart: row.slot_start,
      slotEnd: row.slot_end,
      status: row.status as AuditBookingStatus,
      userNotes: row.user_notes,
      adminNotes: row.admin_notes,
      createdAt: row.created_at,
      userEmail: (profile?.email as string) ?? "—",
      fullName: (profile?.full_name as string | null) ?? null,
      targetJob: (profile?.target_job as string | null) ?? null,
      phone: (profile?.phone as string | null) ?? null,
    };
  });
}

export async function loadAdminAuditBookings(
  options?: { pendingOnly?: boolean; limit?: number },
): Promise<AdminAuditRow[]> {
  const supabase = createAdminClient();
  const limit = options?.limit ?? 20;

  let query = supabase
    .from("audit_bookings")
    .select(BOOKING_SELECT)
    .order("slot_start", { ascending: true })
    .limit(limit);

  if (options?.pendingOnly) {
    query = query.eq("status", "pending");
  } else {
    query = query.eq("status", "confirmed").gte("slot_start", new Date().toISOString());
  }

  const { data: bookings, error } = await query;
  if (error) throw new Error(error.message);
  return enrichAuditBookings(bookings ?? []);
}

export async function loadAdminAuditHistory(limit = 80): Promise<AdminAuditRow[]> {
  const supabase = createAdminClient();

  const { data: bookings, error } = await supabase
    .from("audit_bookings")
    .select(BOOKING_SELECT)
    .neq("status", "pending")
    .order("slot_start", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return enrichAuditBookings(bookings ?? []);
}

async function assertAdminAccess(
  booking: { admin_token: string },
  auth: { adminToken?: string; asTrustedAdmin?: boolean },
) {
  if (auth.asTrustedAdmin) return null;
  if (!auth.adminToken || booking.admin_token !== auth.adminToken) {
    return "Acces non autorise.";
  }
  return null;
}

async function isSlotTaken(
  supabase: ReturnType<typeof createAdminClient>,
  slotStartISO: string,
  excludeBookingId: string,
) {
  const { data } = await supabase
    .from("audit_bookings")
    .select("id")
    .eq("slot_start", slotStartISO)
    .in("status", ["pending", "confirmed"])
    .neq("id", excludeBookingId)
    .maybeSingle();

  return Boolean(data);
}

async function notifyAuditRescheduled(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  slotStart: string,
) {
  const label = new Date(slotStart).toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    dateStyle: "short",
    timeStyle: "short",
  });
  await supabase.from("notifications").insert({
    user_id: userId,
    type: "audit_rescheduled",
    title: "Audit reprogrammé",
    message: `Ton audit a été déplacé au ${label}.`,
    link: "/dashboard/audit",
  });
}

export type PatchAdminAuditInput = {
  action?: "confirm" | "decline" | "reschedule" | "save_notes";
  adminNotes?: string;
  slotStart?: string;
};

export async function patchAdminAuditBooking(
  bookingId: string,
  patch: PatchAdminAuditInput,
  auth: { adminToken?: string; asTrustedAdmin?: boolean },
): Promise<
  | { ok: true; status: AuditBookingStatus; slotStart: string }
  | { ok: false; error: string }
> {
  const supabase = createAdminClient();

  const { data: booking, error: readError } = await supabase
    .from("audit_bookings")
    .select("id, status, admin_token, user_id, slot_start")
    .eq("id", bookingId)
    .maybeSingle();

  if (readError || !booking) {
    return { ok: false, error: "Reservation introuvable." };
  }

  const accessError = await assertAdminAccess(booking, auth);
  if (accessError) return { ok: false, error: accessError };

  const updates: Record<string, unknown> = {};

  if (patch.adminNotes !== undefined) {
    updates.admin_notes = patch.adminNotes.trim() || null;
  }

  if (patch.action === "confirm" || patch.action === "decline") {
    if (booking.status !== "pending") {
      return { ok: false, error: `Deja traite (${booking.status}).` };
    }
    updates.status = patch.action === "confirm" ? "confirmed" : "declined";
  }

  if (patch.action === "reschedule" || patch.slotStart) {
    if (!patch.slotStart) {
      return { ok: false, error: "Nouveau creneau requis." };
    }
    const slotStart = new Date(patch.slotStart);
    if (slotStart.getTime() <= Date.now()) {
      return { ok: false, error: "Le creneau doit etre dans le futur." };
    }
    if (!isSlotAllowed(patch.slotStart)) {
      return {
        ok: false,
        error: "Creneau invalide (semaine 18h-22h, week-end 10h-14h).",
      };
    }
    const slotStartISO = slotStart.toISOString();
    if (await isSlotTaken(supabase, slotStartISO, bookingId)) {
      return { ok: false, error: "Ce creneau est deja pris." };
    }
    const slotEnd = new Date(slotStart.getTime() + 60 * 60_000);
    updates.slot_start = slotStartISO;
    updates.slot_end = slotEnd.toISOString();

    if (booking.slot_start !== slotStartISO) {
      await notifyAuditRescheduled(supabase, booking.user_id as string, slotStartISO);
    }
  }

  if (Object.keys(updates).length === 0) {
    return {
      ok: true,
      status: booking.status as AuditBookingStatus,
      slotStart: booking.slot_start as string,
    };
  }

  const { error: updateError } = await supabase
    .from("audit_bookings")
    .update(updates)
    .eq("id", bookingId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  const { data: updated } = await supabase
    .from("audit_bookings")
    .select("status, slot_start")
    .eq("id", bookingId)
    .single();

  return {
    ok: true,
    status: (updated?.status ?? booking.status) as AuditBookingStatus,
    slotStart: (updated?.slot_start ?? booking.slot_start) as string,
  };
}

/** @deprecated Utiliser patchAdminAuditBooking */
export async function updateAuditBookingStatus(
  bookingId: string,
  action: "confirm" | "decline",
  auth: { adminToken?: string; asTrustedAdmin?: boolean },
) {
  const result = await patchAdminAuditBooking(bookingId, { action }, auth);
  if (!result.ok) return result;
  return { ok: true as const, status: result.status };
}
