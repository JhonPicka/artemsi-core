import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

export async function getAdminUserOrNull() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

export function adminUnauthorizedResponse() {
  return NextResponse.json({ error: "Acces reserve a l'administrateur." }, { status: 403 });
}
