import { NextResponse } from "next/server";
import { z } from "zod";

import { adminUnauthorizedResponse, getAdminUserOrNull } from "@/lib/admin-api-auth";
import {
  keywordsFromApplicationGuide,
  normalizeApplicationGuide,
} from "@/lib/offer-application-guide";
import { runOfferMatching } from "@/lib/run-offer-matching";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  title: z.string().min(2).max(200),
  company: z.string().max(200).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  url: z.string().url(),
  description: z.string().min(20).max(8000),
  source: z.enum(["partner", "autre"]).default("partner"),
  isPublic: z.boolean().default(true),
  isPartnerExclusive: z.boolean().default(false),
  keywords: z.array(z.string().min(2).max(60)).max(20).optional().nullable(),
  applicationGuide: z.record(z.string(), z.unknown()).optional().nullable(),
  runMatching: z.boolean().default(true),
});

export async function POST(request: Request) {
  if (!(await getAdminUserOrNull())) {
    return adminUnauthorizedResponse();
  }

  const payload = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(payload);
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
    const keywordsFromGuide = keywordsFromApplicationGuide(applicationGuide);
    const keywordsExplicit = data.keywords?.filter((k) => k.trim()) ?? [];
    const keywords =
      keywordsExplicit.length > 0
        ? keywordsExplicit
        : keywordsFromGuide.length > 0
          ? keywordsFromGuide
          : null;

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
        keywords: keywords && keywords.length > 0 ? keywords : null,
        application_guide: applicationGuide,
      })
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    let matching = null;
    if (data.runMatching) {
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
