import { NextResponse } from "next/server";
import { z } from "zod";

import { isSlotAllowed } from "@/lib/audit-slots";
import { hasApiBillingAccess } from "@/lib/billing";
import { getAdminAuditsPath } from "@/lib/admin-auth";
import { getAdminEmail, getAppUrl, sendEmail } from "@/lib/email";
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

  if (!(await hasApiBillingAccess(user))) {
    return NextResponse.json({ error: "Abonnement actif requis." }, { status: 402 });
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
      { error: "Creneau non autorise (semaine 18h-22h, week-end 10h-14h)." },
      { status: 400 },
    );
  }

  const slotStart = new Date(parsed.data.slotStart);
  if (slotStart.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Creneau dans le passe." }, { status: 400 });
  }

  const slotEnd = new Date(slotStart.getTime() + 60 * 60_000);

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

  const adminEmail = getAdminEmail();
  if (adminEmail) {
    const baseUrl = getAppUrl();
    const dashboardUrl = `${baseUrl}${getAdminAuditsPath()}`;
    const confirmUrl = `${baseUrl}/admin/audit/${booking.id}?token=${booking.admin_token}&action=confirm`;
    const declineUrl = `${baseUrl}/admin/audit/${booking.id}?token=${booking.admin_token}&action=decline`;
    const slotLabel = new Date(booking.slot_start).toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
      dateStyle: "full",
      timeStyle: "short",
    });

    await sendEmail({
      to: adminEmail,
      subject: `Demande d'audit - ${slotLabel}`,
      html: `
        <p>Nouvelle demande de reservation d'audit :</p>
        <ul>
          <li><strong>Utilisateur :</strong> ${user.email}</li>
          <li><strong>Creneau :</strong> ${slotLabel}</li>
          <li><strong>Notes :</strong> ${parsed.data.notes ?? "-"}</li>
        </ul>
        <p>
          <a href="${dashboardUrl}"><strong>Traiter dans le tableau de bord</strong></a>
          (connecte-toi avec ton compte admin)
        </p>
        <p style="margin-top:12px;font-size:14px;color:#666;">
          Liens directs : <a href="${confirmUrl}">Confirmer</a> &nbsp;|&nbsp;
          <a href="${declineUrl}">Refuser</a>
        </p>
      `,
    });
  }

  return NextResponse.json({ ok: true, id: booking.id });
}
