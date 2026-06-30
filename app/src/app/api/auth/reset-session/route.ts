import { NextResponse } from "next/server";

import {
  clearSupabaseAuthCookiesOnResponse,
  listObviouslyCorruptAuthCookieNames,
} from "@/lib/supabase/sanitize-auth-cookies";

function safeNextPath(raw: string | null, fallback: string) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }
  return raw;
}

function parseRequestCookies(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  return cookieHeader
    .split(";")
    .map((part) => {
      const [name, ...rest] = part.trim().split("=");
      return name ? { name, value: rest.join("=") } : null;
    })
    .filter((cookie): cookie is { name: string; value: string } => cookie !== null);
}

function allSupabaseAuthCookieNames(request: Request): string[] {
  const names = new Set<string>();
  for (const cookie of parseRequestCookies(request)) {
    if (cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")) {
      names.add(cookie.name);
    }
  }
  return [...names];
}

/** Efface les cookies auth Supabase puis redirige (sans appeler signOut — évite crash UTF-8). */
export async function GET(request: Request) {
  const parsed = parseRequestCookies(request);
  const invalidCookieNames = listObviouslyCorruptAuthCookieNames(parsed);

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

  const response = NextResponse.redirect(redirectUrl);
  const toClear = new Set([
    ...allSupabaseAuthCookieNames(request),
    ...invalidCookieNames,
  ]);
  clearSupabaseAuthCookiesOnResponse(response, [...toClear]);

  return response;
}
