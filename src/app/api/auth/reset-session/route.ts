import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function safeNextPath(raw: string | null, fallback: string) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }
  return raw;
}

/** Déconnexion via Route Handler (les cookies sont bien effacés). */
export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const requestUrl = new URL(request.url);
  const email = requestUrl.searchParams.get("email");
  const error = requestUrl.searchParams.get("error");
  const next = safeNextPath(requestUrl.searchParams.get("next"), "/login");
  const redirectUrl = new URL(next, request.url);

  if (next === "/login") {
    if (email) {
      redirectUrl.searchParams.set("email", email);
    }
    if (error) {
      redirectUrl.searchParams.set("error", error);
    }
  }

  return NextResponse.redirect(redirectUrl);
}
