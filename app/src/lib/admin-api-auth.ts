import { NextResponse } from "next/server";

import { isAdminUser } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

export async function getAdminUserOrNull() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) return null;
  return user;
}

export function adminUnauthorizedResponse() {
  return NextResponse.json({ error: "Acces reserve a l'administrateur." }, { status: 403 });
}
