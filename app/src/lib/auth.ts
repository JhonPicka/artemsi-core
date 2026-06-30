import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { safeGetUser } from "@/lib/supabase/safe-get-user";

export async function getCurrentUser() {
  const supabase = await createClient();
  return safeGetUser(supabase);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
