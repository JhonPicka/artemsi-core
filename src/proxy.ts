import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

import {
  needsPasswordSetup,
  resolveLoginPageRedirect,
  resolvePostAuthRedirect,
} from "@/lib/auth-session";
import { updateSession } from "@/lib/supabase/proxy";

const PROTECTED_ROUTES = ["/dashboard", "/onboarding", "/admin"];

/** Routes auth exactes (pas /signup/finish). */
const AUTH_ENTRY_ROUTES = ["/login", "/signup"];

function isRouteMatch(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isAuthEntryRoute(pathname: string) {
  return AUTH_ENTRY_ROUTES.includes(pathname);
}

function isPublicAuthFlowRoute(pathname: string) {
  return pathname === "/signup/finish" || pathname.startsWith("/auth/");
}

async function redirectForAuthenticatedUser(request: NextRequest, user: User) {
  const target = await resolvePostAuthRedirect(user);
  return NextResponse.redirect(new URL(target, request.url));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = isRouteMatch(pathname, PROTECTED_ROUTES);
  const isAuthEntry = isAuthEntryRoute(pathname);
  const isPublicAuthFlow = isPublicAuthFlowRoute(pathname);

  if (!isProtectedRoute && !isAuthEntry && !isPublicAuthFlow) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  if (isPublicAuthFlow) {
    if (user && pathname === "/signup/finish" && !needsPasswordSetup(user)) {
      return redirectForAuthenticatedUser(request, user);
    }
    return response;
  }

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isAuthEntry) {
    if (pathname === "/login") {
      const loginTarget = await resolveLoginPageRedirect(user);
      if (loginTarget) {
        return NextResponse.redirect(new URL(loginTarget, request.url));
      }
      return response;
    }
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
    "/auth/:path*",
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/admin/:path*",
  ],
};
