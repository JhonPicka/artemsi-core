import { NextResponse } from "next/server";
import { z } from "zod";

import { adminUnauthorizedResponse, getAdminUserOrNull } from "@/lib/admin-api-auth";
import { extractOfferFieldsFromUrl } from "@/lib/offer-page-extract";
import { getRequestKey, takeRateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  url: z.string().url("URL invalide"),
  pastedText: z.string().max(50_000).optional(),
});

export async function POST(request: Request) {
  const rate = takeRateLimit({
    bucket: "admin-offer-extract",
    key: getRequestKey(request),
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Trop de requêtes d'extraction. Réessaie plus tard." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } },
    );
  }

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

  try {
    const result = await extractOfferFieldsFromUrl({
      url: parsed.data.url,
      pastedText: parsed.data.pastedText,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur d'extraction" },
      { status: 500 },
    );
  }
}
