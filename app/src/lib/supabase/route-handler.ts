import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";

/** Client Supabase qui écrit les cookies de session sur la réponse HTTP. */
export function createClientFromRequest(
  request: NextRequest,
  response: NextResponse,
) {
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as CookieOptions);
          });
        },
      },
    },
  );
}

export function redirectWithCookies(
  request: NextRequest,
  from: NextResponse,
  pathname: string,
) {
  const redirect = NextResponse.redirect(new URL(pathname, request.url));
  for (const cookie of from.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}
