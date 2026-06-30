import { NextResponse } from "next/server";
import { z } from "zod";

import { adminUnauthorizedResponse, getAdminUserOrNull } from "@/lib/admin-api-auth";
import { runOfferMatching, runOfferMatchingForOffers } from "@/lib/run-offer-matching";

const bodySchema = z.object({
  offerIds: z.array(z.string().uuid()).optional(),
  dryRun: z.boolean().optional(),
});

/** Déclenchement manuel du matching (admin). */
export async function POST(request: Request) {
  if (!(await getAdminUserOrNull())) {
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
    const { offerIds, dryRun = false } = parsed.data;
    const matching =
      offerIds && offerIds.length > 0
        ? await runOfferMatchingForOffers(offerIds, { dryRun })
        : await runOfferMatching({ dryRun });

    return NextResponse.json({ ok: true, matching });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur matching offres" },
      { status: 500 },
    );
  }
}
