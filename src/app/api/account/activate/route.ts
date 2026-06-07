import { NextResponse, type NextRequest } from "next/server";

import { startPaidAccountSession } from "@/lib/paid-account-activation";
import { getRequestKey, takeRateLimit } from "@/lib/rate-limit";
import { createClientFromRequest } from "@/lib/supabase/route-handler";
import { activatePaidAccountSchema } from "@/lib/validation";

function safeReturnPath(raw: string | null, fallback: string) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }
  return raw;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const parsed = activatePaidAccountSchema.safeParse({
    email: formData.get("email"),
  });

  const returnTo = safeReturnPath(
    typeof formData.get("return_to") === "string"
      ? (formData.get("return_to") as string)
      : null,
    "/activer-mon-compte",
  );

  if (!parsed.success) {
    const url = new URL(returnTo, request.url);
    url.searchParams.set("error", parsed.error.issues[0]?.message ?? "Email invalide");
    return NextResponse.redirect(url);
  }

  const email = parsed.data.email.trim().toLowerCase();
  const requestKey = getRequestKey(request);

  const emailLimit = await takeRateLimit({
    bucket: "paid-account-activate-email",
    key: email,
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });

  if (!emailLimit.ok) {
    const url = new URL(returnTo, request.url);
    url.searchParams.set("email", email);
    url.searchParams.set(
      "error",
      `Trop de tentatives pour cet email. Réessaie dans ${emailLimit.retryAfterSec} s.`,
    );
    return NextResponse.redirect(url);
  }

  const ipLimit = await takeRateLimit({
    bucket: "paid-account-activate-ip",
    key: requestKey,
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });

  if (!ipLimit.ok) {
    const url = new URL(returnTo, request.url);
    url.searchParams.set("email", email);
    url.searchParams.set(
      "error",
      `Trop de tentatives. Réessaie dans ${ipLimit.retryAfterSec} s.`,
    );
    return NextResponse.redirect(url);
  }

  let response = NextResponse.redirect(new URL("/signup/finish", request.url));
  const supabase = createClientFromRequest(request, response);

  try {
    const result = await startPaidAccountSession(email, supabase);
    if (!result.ok) {
      const url = new URL(returnTo, request.url);
      url.searchParams.set("email", email);
      url.searchParams.set("error", result.error);
      return NextResponse.redirect(url);
    }
    return response;
  } catch (cause) {
    console.error("[api/account/activate]", cause);
    const url = new URL(returnTo, request.url);
    url.searchParams.set("email", email);
    url.searchParams.set(
      "error",
      "Activation impossible pour le moment. Réessaie ou renvoie l'email d'activation.",
    );
    return NextResponse.redirect(url);
  }
}
