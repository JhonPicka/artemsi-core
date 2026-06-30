import { NextResponse } from "next/server";

import { adminUnauthorizedResponse, getAdminUserOrNull } from "@/lib/admin-api-auth";
import { parseOffersCsv } from "@/lib/offer-csv-import";
import { runOfferMatchingForOffers } from "@/lib/run-offer-matching";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const INSERT_BATCH = 50;

export async function POST(request: Request) {
  if (!(await getAdminUserOrNull())) {
    return adminUnauthorizedResponse();
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const runMatching = formData?.get("runMatching") === "true";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier CSV requis." }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
    return NextResponse.json(
      { error: "Format attendu : fichier .csv (UTF-8)." },
      { status: 400 },
    );
  }

  const text = await file.text();
  const { rows, issues } = parseOffersCsv(text);

  if (rows.length === 0) {
    return NextResponse.json(
      {
        error: "Aucune ligne valide a importer.",
        issues,
      },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const urls = rows.map((row) => row.url);

  const { data: existingRows, error: existingError } = await supabase
    .from("offers")
    .select("url")
    .in("url", urls);

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const existingUrls = new Set((existingRows ?? []).map((row) => String(row.url).toLowerCase()));

  const toInsert = rows.filter((row) => {
    if (existingUrls.has(row.url.toLowerCase())) {
      issues.push({
        line: row.line,
        message: "URL deja en base — ligne ignoree.",
      });
      return false;
    }
    return true;
  });

  if (toInsert.length === 0) {
    return NextResponse.json(
      {
        error: "Toutes les lignes sont deja en base ou invalides.",
        inserted: 0,
        skippedDuplicates: rows.length,
        issues,
      },
      { status: 409 },
    );
  }

  let inserted = 0;
  const insertedOfferIds: string[] = [];

  try {
    for (let i = 0; i < toInsert.length; i += INSERT_BATCH) {
      const batch = toInsert.slice(i, i + INSERT_BATCH).map((row) => ({
        title: row.title,
        company: row.company,
        location: row.location,
        url: row.url,
        description: row.description,
        study_domain: row.studyDomain,
        source: "autre" as const,
        is_public: row.isPublic,
        is_partner_exclusive: false,
        application_guide: null,
      }));

      const { data: insertedRows, error: insertError } = await supabase
        .from("offers")
        .insert(batch)
        .select("id");
      if (insertError) {
        return NextResponse.json(
          {
            error: insertError.message,
            inserted,
            issues,
          },
          { status: 500 },
        );
      }
      inserted += insertedRows?.length ?? 0;
      insertedOfferIds.push(...(insertedRows ?? []).map((row) => row.id as string));
    }

    const matching = runMatching
      ? await runOfferMatchingForOffers(insertedOfferIds)
      : null;

    return NextResponse.json({
      ok: true,
      inserted,
      skippedDuplicates: rows.length - toInsert.length,
      issues,
      matching,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur import CSV",
        inserted,
        issues,
      },
      { status: 500 },
    );
  }
}
