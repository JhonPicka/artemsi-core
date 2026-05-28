import { NextResponse, type NextRequest } from "next/server";

import { getPostLoginPath } from "@/lib/admin-auth";
import { updateSession } from "@/lib/supabase/proxy";

const AUTH_ROUTES = ["/login", "/signup"];
const PROTECTED_ROUTES = ["/dashboard", "/onboarding", "/admin"];

function isRouteMatch(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAuthRoute = isRouteMatch(pathname, AUTH_ROUTES);
  const isProtectedRoute = isRouteMatch(pathname, PROTECTED_ROUTES);

  if (!isAuthRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL(getPostLoginPath(user), request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/admin/:path*",
  ],
};
