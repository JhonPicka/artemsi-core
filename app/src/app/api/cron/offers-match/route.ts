import { NextResponse } from "next/server";

import {
  cronMissingSecretResponse,
  cronUnauthorizedResponse,
  isCronAuthorized,
} from "@/lib/cron-auth";
import { runOfferMatching } from "@/lib/run-offer-matching";

/** Cron Vercel : assignation offres en base → profils (offres ajoutees manuellement). */
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
    const result = await runOfferMatching({ dryRun: false });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur matching offres" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
