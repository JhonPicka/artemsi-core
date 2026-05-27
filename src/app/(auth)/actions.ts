"use server";

import { redirect } from "next/navigation";

import { isBillingBypassEmail } from "@/lib/billing-access";
import { getPostLoginPath, isAdminEmail } from "@/lib/admin-auth";
import { syncUserBilling, userHasBillingAccess } from "@/lib/billing";
import { isBillingEnforced } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema } from "@/lib/validation";

export type AuthFormState = {
  error?: string;
  success?: string;
};

export async function signupAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptLegal: formData.get("acceptLegal")?.toString(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const isPrivilegedEmail = isAdminEmail(normalizedEmail) || isBillingBypassEmail(normalizedEmail);

  if (isBillingEnforced() && !isPrivilegedEmail) {
    const hasPaid = await userHasBillingAccess(normalizedEmail);
    if (!hasPaid) {
      return {
        error:
          "Aucun abonnement actif trouvé pour cet email. Souscris d’abord, puis reviens créer ton compte avec le même email.",
      };
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session && data.user?.email) {
    if (isAdminEmail(data.user.email)) {
      redirect(getPostLoginPath(data.user.email));
    }
    await syncUserBilling(data.user);
    if (!(await userHasBillingAccess(data.user.email))) {
      redirect("/subscribe");
    }
    redirect("/onboarding");
  }

  return {
    success:
      "Compte créé. Vérifie ta boîte mail si la confirmation email est activée.",
  };
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Email ou mot de passe incorrect" };
  }

  const user = data.user;
  const userId = user?.id;
  if (!userId || !user?.email) {
    return { error: "Impossible de recuperer la session utilisateur" };
  }

  if (isAdminEmail(user.email)) {
    redirect(getPostLoginPath(user.email));
  }

  await syncUserBilling(user);
  if (!(await userHasBillingAccess(user.email))) {
    redirect("/subscribe");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
