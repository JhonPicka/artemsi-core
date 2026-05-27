"use server";

import { redirect } from "next/navigation";

import { isBillingBypassEmail } from "@/lib/billing-access";
import { getPostLoginPath, isAdminEmail } from "@/lib/admin-auth";
import { syncUserBilling, userHasBillingAccess } from "@/lib/billing";
import { isBillingEnforced } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, passwordChangeSchema, signupSchema } from "@/lib/validation";

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
  const billingRequired = isBillingEnforced() && !isPrivilegedEmail;

  if (billingRequired) {
    try {
      const hasPaid = await userHasBillingAccess(normalizedEmail);
      if (!hasPaid) {
        return {
          error:
            "Aucun abonnement actif trouvé pour cet email. Souscris d’abord, puis reviens créer ton compte avec le même email.",
        };
      }
    } catch {
      return {
        error:
          "Configuration facturation incomplète côté serveur. Vérifie SUPABASE_SERVICE_ROLE_KEY dans Vercel.",
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
    if (billingRequired) {
      try {
        await syncUserBilling(data.user);
        if (!(await userHasBillingAccess(data.user.email))) {
          redirect("/subscribe");
        }
      } catch {
        return {
          error:
            "Configuration facturation incomplète côté serveur. Vérifie SUPABASE_SERVICE_ROLE_KEY dans Vercel.",
        };
      }
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

  const billingRequired = isBillingEnforced() && !isBillingBypassEmail(user.email);
  if (billingRequired) {
    try {
      await syncUserBilling(user);
      if (!(await userHasBillingAccess(user.email))) {
        redirect("/subscribe");
      }
    } catch {
      return {
        error:
          "Connexion impossible: configuration facturation serveur incomplète. Vérifie SUPABASE_SERVICE_ROLE_KEY dans Vercel.",
      };
    }
  } else if (isBillingBypassEmail(user.email)) {
    // Best effort sync for bypass users; do not block login if billing tables are unavailable.
    await syncUserBilling(user).catch(() => undefined);
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

export async function changePasswordAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "Tu dois être connecté." };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });
  if (signInError) {
    return { error: "Mot de passe actuel incorrect." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });
  if (updateError) {
    return { error: updateError.message };
  }

  return { success: "Mot de passe mis à jour." };
}
