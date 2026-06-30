import { NextResponse } from "next/server";
import { z } from "zod";

import { adminUnauthorizedResponse, getAdminUserOrNull } from "@/lib/admin-api-auth";
import {
  getLbaImportDailyDecision,
  setLbaImportDailyDecision,
} from "@/lib/lba-import-daily-decision";

const bodySchema = z.object({
  approved: z.boolean(),
});

/** Choix admin du jour : autoriser ou non l'import LBA automatique (cron). */
export async function GET() {
  if (!(await getAdminUserOrNull())) {
    return adminUnauthorizedResponse();
  }

  try {
    const decision = await getLbaImportDailyDecision();
    return NextResponse.json({ ok: true, decision });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur lecture décision LBA" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const admin = await getAdminUserOrNull();
  if (!admin) {
    return adminUnauthorizedResponse();
  }

  const payload = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Payload invalide" },
      { status: 400 },
    );
  }

  try {
    const decision = await setLbaImportDailyDecision({
      approved: parsed.data.approved,
      decidedBy: admin.id,
    });
    return NextResponse.json({ ok: true, decision });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur enregistrement décision LBA" },
      { status: 500 },
    );
  }
}
