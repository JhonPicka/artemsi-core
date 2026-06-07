"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getFreshLoginPath } from "@/lib/auth-paths";
import { markPasswordSetupComplete, redirectAfterAuth } from "@/lib/auth-session";
import { resendActivationEmail } from "@/lib/account-setup";
import { getBillingStatusByEmail, userHasBillingAccess } from "@/lib/billing";
import { startPaidAccountSession } from "@/lib/paid-account-activation";
import { takeRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { activatePaidAccountSchema, loginSchema, setPasswordSchema } from "@/lib/validation";

export type AuthFormState = {
  error?: string;
  success?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
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
      error: "Session invalide. Ouvre le lien dans ton email après ton paiement.",
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
        error:
          "Identifiants incorrects. Si tu viens de payer, active ton compte sur /activer-mon-compte.",
      };
    }
    return { error: "Identifiants incorrects." };
  }

  const user = data.user;
  if (!user?.email) {
    return { error: "Impossible de récupérer la session utilisateur." };
  }

  if (!(await userHasBillingAccess(user.email))) {
    await supabase.auth.signOut();
    return {
      error:
        "Aucun abonnement actif pour cet email. Finalise ton paiement ou patiente quelques instants, puis réessaie.",
    };
  }

  return redirectAfterAuth(user);
}

export async function activatePaidAccountAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = activatePaidAccountSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const email = normalizeEmail(parsed.data.email);
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip")?.trim() ??
    "unknown";

  const emailLimit = await takeRateLimit({
    bucket: "paid-account-activate-email",
    key: email,
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });

  if (!emailLimit.ok) {
    return {
      error: `Trop de tentatives pour cet email. Réessaie dans ${emailLimit.retryAfterSec} s.`,
    };
  }

  const ipLimit = await takeRateLimit({
    bucket: "paid-account-activate-ip",
    key: ip,
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });

  if (!ipLimit.ok) {
    return {
      error: `Trop de tentatives. Réessaie dans ${ipLimit.retryAfterSec} s.`,
    };
  }

  let result;
  try {
    result = await startPaidAccountSession(email);
  } catch (cause) {
    console.error("[activatePaidAccountAction]", cause);
    return {
      error: "Activation impossible pour le moment. Réessaie ou renvoie l'email d'activation.",
    };
  }

  if (!result.ok) {
    return { error: result.error };
  }

  if (result.mode === "login") {
    redirect(getFreshLoginPath({ email }));
  }

  redirect("/signup/finish");
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
