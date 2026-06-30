import { NextResponse } from "next/server";
import { z } from "zod";

import { adminUnauthorizedResponse, getAdminUserOrNull } from "@/lib/admin-api-auth";
import { runLbaOfferImport } from "@/lib/lba-import";
import { runOfferMatching } from "@/lib/run-offer-matching";

export const runtime = "nodejs";

const bodySchema = z.object({
  runMatching: z.boolean().optional(),
  /** admin = requêtes LBA basées sur le profil admin ; all = tous les profils onboardés */
  profileScope: z.enum(["admin", "all"]).optional(),
});

/** Import manuel La Bonne Alternance (sites carrière uniquement). */
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

  const { runMatching = false, profileScope = "admin" } = parsed.data;
  const importOptions =
    profileScope === "admin" ? { profileUserIds: [admin.id] } : undefined;

  try {
    const importResult = await runLbaOfferImport(importOptions);
    const matching = runMatching ? await runOfferMatching({ dryRun: false }) : null;

    return NextResponse.json({
      ok: true,
      profileScope,
      import: importResult,
      matching,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur import LBA" },
      { status: 500 },
    );
  }
}
