import { NextResponse } from "next/server";

import { adminUnauthorizedResponse, getAdminUserOrNull } from "@/lib/admin-api-auth";
import { adminOfferBodySchema } from "@/lib/admin-offer-schema";
import { normalizeApplicationGuide } from "@/lib/offer-application-guide";
import { runOfferMatching } from "@/lib/run-offer-matching";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  if (!(await getAdminUserOrNull())) {
    return adminUnauthorizedResponse();
  }

  const payload = await request.json().catch(() => null);
  const parsed = adminOfferBodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Payload invalide" },
      { status: 400 },
    );
  }

  const data = parsed.data;

  try {
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("offers")
      .select("id, title")
      .eq("url", data.url)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error: "Cette URL existe deja en base.",
          offerId: existing.id,
          title: existing.title,
        },
        { status: 409 },
      );
    }

    const applicationGuide = normalizeApplicationGuide(data.applicationGuide);

    const { data: inserted, error: insertError } = await supabase
      .from("offers")
      .insert({
        title: data.title,
        company: data.company ?? null,
        location: data.location ?? null,
        url: data.url,
        description: data.description,
        source: data.source,
        is_public: data.isPublic,
        is_partner_exclusive: data.isPartnerExclusive,
        application_guide: applicationGuide,
      })
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    let matching = null;
    if (parsed.data.runMatching !== false) {
      matching = await runOfferMatching({ dryRun: false });
    }

    return NextResponse.json({
      ok: true,
      offerId: inserted.id,
      matching,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur lors de la publication" },
      { status: 500 },
    );
  }
}
