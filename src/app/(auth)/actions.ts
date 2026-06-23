"use server";

import { redirect } from "next/navigation";

import { getFreshLoginPath } from "@/lib/auth-paths";
import { redirectAfterAuth } from "@/lib/auth-session";
import { resendActivationEmail } from "@/lib/account-setup";
import { userHasBillingAccess } from "@/lib/billing";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema } from "@/lib/validation";

export type AuthFormState = {
  error?: string;
  success?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
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

  const email = normalizeEmail(parsed.data.email);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Identifiants incorrects." };
  }

  const user = data.user;
  if (!user?.email) {
    return { error: "Impossible de récupérer la session utilisateur." };
  }

  return redirectAfterAuth(user);
}

export async function signupAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptLegal: formData.get("acceptLegal"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const email = normalizeEmail(parsed.data.email);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
    options: {
      data: {
        password_set: true,
        password_setup_pending: false,
      },
    },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("registered") || message.includes("already")) {
      return {
        error: "Un compte existe déjà pour cet email. Connecte-toi directement.",
      };
    }
    return { error: "Impossible de créer le compte pour le moment. Réessaie plus tard." };
  }

  if (data.session && data.user) {
    return redirectAfterAuth(data.user);
  }

  return {
    success:
      "Compte créé. Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.",
  };
}

export async function resendSetupEmailAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const raw = formData.get("email");
  if (typeof raw !== "string" || !raw.includes("@")) {
    return { error: "Email invalide" };
  }

  const email = normalizeEmail(raw);

  if (!(await userHasBillingAccess(email))) {
    return {
      error: "Aucun abonnement actif pour cet email.",
    };
  }

  try {
    const result = await resendActivationEmail(email);
    if (!result.needsPasswordSetup) {
      return {
        success:
          "Un compte existe déjà pour cet email. Connecte-toi sur /login avec ton mot de passe.",
      };
    }
    return {
      success: "Email renvoyé. Vérifie ta boîte mail (et les spams).",
    };
  } catch (cause) {
    console.error("[resendSetupEmailAction]", cause);
    return { error: "Impossible d'envoyer l'email pour le moment. Réessaie plus tard." };
  }
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function logoutToLoginAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(getFreshLoginPath());
}
