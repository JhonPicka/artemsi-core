import { NextResponse } from "next/server";

import { adminUnauthorizedResponse, getAdminUserOrNull } from "@/lib/admin-api-auth";
import { adminOfferBodySchema } from "@/lib/admin-offer-schema";
import { loadAdminOfferById, updateAdminOffer } from "@/lib/admin-offers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!(await getAdminUserOrNull())) {
    return adminUnauthorizedResponse();
  }

  const { id } = await context.params;
  try {
    const offer = await loadAdminOfferById(id);
    if (!offer) {
      return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });
    }
    return NextResponse.json({ offer });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur chargement offre" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await getAdminUserOrNull())) {
    return adminUnauthorizedResponse();
  }

  const { id } = await context.params;
  const payload = await request.json().catch(() => null);
  const parsed = adminOfferBodySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Payload invalide" },
      { status: 400 },
    );
  }

  const result = await updateAdminOffer(id, parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    offerId: id,
    matching: result.matching,
  });
}
