import { NextResponse } from "next/server";

import { runOfferMatching } from "@/lib/run-offer-matching";

function cronSecrets(): string[] {
  const secret = process.env.CRON_SECRET?.trim();
  return secret ? [secret] : [];
}

function isAuthorized(request: Request) {
  const secrets = cronSecrets();
  if (secrets.length === 0) return false;

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice("Bearer ".length).trim();
    if (secrets.includes(token)) return true;
  }

  const cronHeader = request.headers.get("x-cron-secret");
  if (cronHeader && secrets.includes(cronHeader)) return true;

  return false;
}

/** Cron Vercel : assignation offres en base → profils (offres ajoutees manuellement). */
export async function GET(request: Request) {
  if (cronSecrets().length === 0) {
    return NextResponse.json({ error: "CRON_SECRET manquant" }, { status: 500 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
