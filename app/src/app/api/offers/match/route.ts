import { NextResponse } from "next/server";
import { z } from "zod";

import { runOfferMatching } from "@/lib/run-offer-matching";

const bodySchema = z.object({
  dryRun: z.boolean().optional(),
});

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice("Bearer ".length).trim() === secret;
}

/** Declenchement manuel du matching (apres ajout d'offres en base). */
export async function POST(request: Request) {
  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json({ error: "CRON_SECRET manquant" }, { status: 500 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const result = await runOfferMatching({ dryRun: parsed.data.dryRun ?? false });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur matching offres" },
      { status: 500 },
    );
  }
}
