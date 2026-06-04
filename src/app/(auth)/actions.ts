"use server";

import { redirect } from "next/navigation";

import {
  markPasswordSetupComplete,
  redirectAfterAuth,
} from "@/lib/auth-session";
import { sendAccountSetupEmail } from "@/lib/account-setup";
import { getBillingStatusByEmail, userHasBillingAccess } from "@/lib/billing";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, setPasswordSchema, signupSchema } from "@/lib/validation";

export type AuthFormState = {
  error?: string;
  success?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isUserAlreadyRegisteredError(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("already") ||
    lower.includes("registered") ||
    lower.includes("exists") ||
    lower.includes("duplicate")
  );
}

/** Inscription manuelle (secours) — parcours principal = email après paiement. */
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

  const email = normalizeEmail(parsed.data.email);

  if (!(await userHasBillingAccess(email))) {
    return {
      error:
        "Aucun abonnement actif pour cet email. Paie d'abord sur la landing, puis utilise le lien reçu par email.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
  });

  if (error) {
    if (isUserAlreadyRegisteredError(error.message)) {
      try {
        await sendAccountSetupEmail(email);
        return {
          success:
            "Un compte existe déjà pour cet email. Nous t'avons renvoyé un lien pour choisir ou réinitialiser ton mot de passe.",
        };
      } catch {
        return {
          error:
            "Ce compte existe déjà. Connecte-toi ou ouvre le lien reçu par email après ton paiement.",
        };
      }
    }
    return { error: error.message };
  }

  if (data.session && data.user) {
    await supabase.auth.updateUser({
      data: { password_setup_pending: false, password_set: true },
    });
    const {
      data: { user: refreshed },
    } = await supabase.auth.getUser();
    if (refreshed) {
      return redirectAfterAuth(refreshed);
    }
  }

  try {
    await sendAccountSetupEmail(email);
  } catch (cause) {
    console.error("[signupAction] setup email", cause);
  }

  return {
    success:
      "Vérifie ta boîte mail : un lien te permet de confirmer ton email et activer ton compte.",
  };
}

export async function finishSignupAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = setPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptLegal: formData.get("acceptLegal")?.toString(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      error: "Session invalide. Ouvre le lien reçu par email après ton paiement.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  await markPasswordSetupComplete(user);

  const {
    data: { user: refreshed },
  } = await supabase.auth.getUser();

  if (!refreshed) {
    return { error: "Session perdue après enregistrement. Reconnecte-toi." };
  }

  return redirectAfterAuth(refreshed);
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
    const billingStatus = await getBillingStatusByEmail(email);
    if (billingStatus === "active") {
      return {
        error: "Identifiants incorrects. Ouvre le lien reçu par email.",
      };
    }
    return { error: "Identifiants incorrects." };
  }

  const user = data.user;
  if (!user?.email) {
    return { error: "Impossible de recuperer la session utilisateur" };
  }

  if (!(await userHasBillingAccess(user.email))) {
    await supabase.auth.signOut();
    return {
      error:
        "Aucun abonnement actif pour cet email. Souscris d'abord, ou attends la confirmation Stripe puis reconnecte-toi.",
    };
  }

  return redirectAfterAuth(user);
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
      error: "Aucun abonnement actif pour cet email. Souscris d'abord sur la landing.",
    };
  }

  try {
    await sendAccountSetupEmail(email);
    return {
      success: "Si un compte existe pour cet email, un nouveau lien vient d'être envoyé.",
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
  redirect("/login");
}
