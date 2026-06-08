import { getAdminEmail, isAdminUser } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

export const ADMIN_SETUP_PATH = "/admin/setup";

type AdminIdentity = { id: string; email?: string | null };

export async function adminNeedsNameSetup(
  user: AdminIdentity | null | undefined,
): Promise<boolean> {
  if (!isAdminUser(user)) {
    return false;
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .maybeSingle();

  return !profile?.full_name?.trim();
}

export async function resolveAdminPostAuthPath(user: AdminIdentity): Promise<string> {
  if (await adminNeedsNameSetup(user)) {
    return ADMIN_SETUP_PATH;
  }
  return "/admin";
}

export type AdminProfileUpsertInput = {
  userId: string;
  email: string;
  fullName: string;
};

/** Profil admin minimal : nom uniquement, pas de parcours candidat. */
export async function upsertAdminProfile(input: AdminProfileUpsertInput) {
  const supabase = await createClient();
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();

  const { error } = await supabase.from("profiles").upsert(
    {
      id: input.userId,
      email,
      full_name: fullName,
      onboarding_completed: true,
      subscription_status: "active",
      regions: [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(error.message);
  }

  return { fullName, email: email === getAdminEmail() ? email : input.email };
}
