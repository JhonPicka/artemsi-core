import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { getAdminHomePath, isAdminUser } from "@/lib/admin-auth";
import { syncUserBilling, userHasBillingAccess } from "@/lib/billing";
import { createClient } from "@/lib/supabase/server";

/** Invite Supabase : mot de passe pas encore choisi sur /signup/finish. */
export function needsPasswordSetup(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.user_metadata?.password_setup_pending === true;
}

export async function markPasswordSetupComplete(user: User) {
  const supabase = await createClient();
  await supabase.auth.updateUser({
    data: {
      password_setup_pending: false,
      password_set: true,
    },
  });
}

/** Où envoyer un utilisateur déjà authentifié (login, proxy, signup). */
export async function resolvePostAuthRedirect(user: User): Promise<string> {
  if (isAdminUser(user)) {
    return getAdminHomePath();
  }

  if (!user.email) {
    return "/login";
  }

  if (needsPasswordSetup(user)) {
    return "/signup/finish";
  }

  await syncUserBilling(user);
  if (!(await userHasBillingAccess(user.email))) {
    return "/subscribe";
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed) {
    return "/onboarding";
  }

  return "/dashboard";
}

/** Server action / page : redirect après auth réussie. */
export async function redirectAfterAuth(user: User): Promise<never> {
  redirect(await resolvePostAuthRedirect(user));
}
