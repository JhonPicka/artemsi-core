import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminAuditsPath, getAdminUserId } from "@/lib/admin-auth";
import {
  auditMonthlyLimitMessage,
  hasReachedMonthlyAuditLimit,
} from "@/lib/audit-booking-limits";
import { AUDIT_AVAILABILITY_LABEL, isSlotAllowed } from "@/lib/audit-slots";
import { userHasProAccess } from "@/lib/billing";
import { getAppUrl } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const bookingSchema = z.object({
  slotStart: z.iso.datetime("Slot invalide"),
  notes: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await userHasProAccess(user))) {
    return NextResponse.json(
      { error: "L'audit CV est réservé aux abonnés Pro." },
      { status: 403 },
    );
  }

  const payload = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  if (!isSlotAllowed(parsed.data.slotStart)) {
    return NextResponse.json(
      { error: `Creneau non autorise (${AUDIT_AVAILABILITY_LABEL}).` },
      { status: 400 },
    );
  }

  const slotStart = new Date(parsed.data.slotStart);
  if (slotStart.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Creneau dans le passe." }, { status: 400 });
  }

  const slotEnd = new Date(slotStart.getTime() + 60 * 60_000);

  const { data: userBookings, error: limitError } = await supabase
    .from("audit_bookings")
    .select("slot_start, status")
    .eq("user_id", user.id)
    .in("status", ["pending", "confirmed"]);

  if (limitError) {
    return NextResponse.json(
      { error: limitError.message ?? "Erreur verification quota audit" },
      { status: 500 },
    );
  }

  if (hasReachedMonthlyAuditLimit(userBookings ?? [], slotStart)) {
    return NextResponse.json({ error: auditMonthlyLimitMessage() }, { status: 429 });
  }

  const { data: booking, error } = await supabase
    .from("audit_bookings")
    .insert({
      user_id: user.id,
      slot_start: slotStart.toISOString(),
      slot_end: slotEnd.toISOString(),
      user_notes: parsed.data.notes ?? null,
    })
    .select("id, admin_token, slot_start")
    .single();

  if (error || !booking) {
    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "Creneau deja reserve, choisis-en un autre." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: error?.message ?? "Erreur creation reservation" },
      { status: 500 },
    );
  }

  const adminUserId = getAdminUserId();
  if (adminUserId) {
    const slotLabel = new Date(booking.slot_start).toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
      dateStyle: "full",
      timeStyle: "short",
    });
    const admin = createAdminClient();
    await admin.from("notifications").insert({
      user_id: adminUserId,
      type: "audit_request",
      title: "Nouvelle demande d'audit",
      message: `${user.email ?? "Utilisateur"} — ${slotLabel}${parsed.data.notes ? ` — ${parsed.data.notes}` : ""}`,
      link: `${getAppUrl()}${getAdminAuditsPath()}`,
    });
  }

  return NextResponse.json({ ok: true, id: booking.id });
}
