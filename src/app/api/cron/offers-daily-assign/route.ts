import { NextResponse } from "next/server";

import {
  cronMissingSecretResponse,
  cronUnauthorizedResponse,
  isCronAuthorized,
} from "@/lib/cron-auth";
import { runDailyOfferAssignments } from "@/lib/run-daily-offer-assignments";

/** Cron : jusqu'à 5 nouvelles offres « Pour moi » / jour / abonné Pro. */
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
    const result = await runDailyOfferAssignments();
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur assignation quotidienne" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
