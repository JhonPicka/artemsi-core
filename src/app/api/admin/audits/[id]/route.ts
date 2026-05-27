import { NextResponse } from "next/server";
import { z } from "zod";

import { adminUnauthorizedResponse, getAdminUserOrNull } from "@/lib/admin-api-auth";
import { patchAdminAuditBooking } from "@/lib/admin-audit";

const bodySchema = z.object({
  action: z.enum(["confirm", "decline", "reschedule", "save_notes"]).optional(),
  adminNotes: z.string().max(4000).optional(),
  slotStart: z.iso.datetime({ message: "Date de creneau invalide" }).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await getAdminUserOrNull())) {
    return adminUnauthorizedResponse();
  }

  const { id } = await context.params;
  const payload = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Payload invalide" },
      { status: 400 },
    );
  }

  if (!parsed.data.action && parsed.data.adminNotes === undefined && !parsed.data.slotStart) {
    return NextResponse.json({ error: "Aucune modification demandee." }, { status: 400 });
  }

  const result = await patchAdminAuditBooking(
    id,
    {
      action: parsed.data.action,
      adminNotes: parsed.data.adminNotes,
      slotStart: parsed.data.slotStart,
    },
    { asTrustedAdmin: true },
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    status: result.status,
    slotStart: result.slotStart,
  });
}
