import { NextResponse } from "next/server";

import {
  cronMissingSecretResponse,
  cronUnauthorizedResponse,
  isCronAuthorized,
} from "@/lib/cron-auth";
import { getLbaImportDateParis, isLbaImportApprovedToday } from "@/lib/lba-import-daily-decision";
import { runLbaOfferImport } from "@/lib/lba-import";
import { runOfferMatching } from "@/lib/run-offer-matching";

/** Cron : import LBA (sites carrière) puis matching — uniquement si validé par l'admin ce matin. */
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json(cronMissingSecretResponse(), {
      status: cronMissingSecretResponse().status,
    });
  }
  if (!isCronAuthorized(request)) {
    return NextResponse.json(cronUnauthorizedResponse(), {
      status: cronUnauthorizedResponse().status,
    });
  }

  try {
    const importDate = getLbaImportDateParis();
    const approved = await isLbaImportApprovedToday();
    if (!approved) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "import_not_approved_today",
        importDate,
      });
    }

    const importResult = await runLbaOfferImport();
    const matchResult = await runOfferMatching({ dryRun: false });
    return NextResponse.json({ ok: true, importDate, import: importResult, match: matchResult });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur import offres LBA" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
