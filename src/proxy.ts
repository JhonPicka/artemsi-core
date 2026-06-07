import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

import { needsPasswordSetup, resolvePostAuthRedirect } from "@/lib/auth-session";
import { updateSession } from "@/lib/supabase/proxy";

const PROTECTED_ROUTES = ["/dashboard", "/onboarding", "/admin"];

/** Routes auth exactes. */
const AUTH_ENTRY_ROUTES = ["/login"];

function isRouteMatch(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isAuthEntryRoute(pathname: string) {
  return AUTH_ENTRY_ROUTES.includes(pathname);
}

function isSessionRefreshRoute(pathname: string) {
  return (
    pathname === "/signup/finish" ||
    pathname === "/activer-mon-compte" ||
    pathname === "/checkout/success" ||
    pathname === "/subscribe" ||
    pathname.startsWith("/auth/confirm") ||
    pathname.startsWith("/auth/callback")
  );
}

async function redirectForAuthenticatedUser(request: NextRequest, user: User) {
  const target = await resolvePostAuthRedirect(user);
  return NextResponse.redirect(new URL(target, request.url));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = isRouteMatch(pathname, PROTECTED_ROUTES);
  const isAuthEntry = isAuthEntryRoute(pathname);
  const isSessionRefresh = isSessionRefreshRoute(pathname);

  if (!isProtectedRoute && !isAuthEntry && !isSessionRefresh) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  if (isSessionRefresh) {
    if (user && pathname === "/signup/finish" && !needsPasswordSetup(user)) {
      return redirectForAuthenticatedUser(request, user);
    }
    return response;
  }

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isAuthEntry && pathname !== "/login") {
    return redirectForAuthenticatedUser(request, user);
  }

  if (user && isProtectedRoute && needsPasswordSetup(user)) {
    return NextResponse.redirect(new URL("/signup/finish", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/signup/finish",
    "/activer-mon-compte",
    "/checkout/success",
    "/subscribe",
    "/auth/confirm",
    "/auth/callback",
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/admin/:path*",
  ],
};
