import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/** Déconnexion via Route Handler (les cookies sont bien effacés). */
export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const requestUrl = new URL(request.url);
  const email = requestUrl.searchParams.get("email");
  const loginUrl = new URL("/login", request.url);
  if (email) {
    loginUrl.searchParams.set("email", email);
  }

  return NextResponse.redirect(loginUrl);
}
