import { NextResponse } from "next/server";
import { z } from "zod";

import { hasApiBillingAccess } from "@/lib/billing";
import { recordOfferInterest, removeOfferInterest } from "@/lib/record-offer-interest";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  offerId: z.string().uuid(),
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
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Payload invalide" },
      { status: 400 },
    );
  }

  try {
    const result = await recordOfferInterest(supabase, user.id, parsed.data.offerId);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
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

  const url = new URL(request.url);
  const offerId = url.searchParams.get("offerId");
  const parsed = z.string().uuid().safeParse(offerId);
  if (!parsed.success) {
    return NextResponse.json({ error: "offerId invalide" }, { status: 400 });
  }

  try {
    const result = await removeOfferInterest(supabase, user.id, parsed.data);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur" },
      { status: 500 },
    );
  }
}
