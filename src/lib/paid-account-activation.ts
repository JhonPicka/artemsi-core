import type { EmailOtpType, SupabaseClient } from "@supabase/supabase-js";

import { userNeedsPasswordSetup } from "@/lib/account-setup";
import { userHasBillingAccess } from "@/lib/billing";
import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function finishRedirectUrl() {
  const appUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${appUrl}/auth/confirm`;
}

function isUserNotFoundError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("not found") ||
    normalized.includes("no user") ||
    normalized.includes("user_not_found")
  );
}

async function markPasswordSetupPending(userId: string) {
  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(userId, {
    user_metadata: {
      password_setup_pending: true,
      password_set: false,
    },
  });
}

async function generateActivationLink(email: string) {
  const admin = createAdminClient();
  const redirectTo = finishRedirectUrl();

  const recovery = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (!recovery.error) {
    return recovery;
  }

  if (!isUserNotFoundError(recovery.error.message)) {
    throw new Error(recovery.error.message);
  }

  const invite = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { redirectTo },
  });

  if (invite.error) {
    throw new Error(invite.error.message);
  }

  return invite;
}

export type PaidAccountActivationResult =
  | { ok: true; mode: "password-setup" }
  | { ok: false; error: string };

/**
 * Démarre une session pour un payeur sans passer par l'email Supabase.
 * Passe un client lié à la réponse HTTP (route handler) pour persister les cookies.
 */
export async function startPaidAccountSession(
  email: string,
  supabaseClient?: SupabaseClient,
): Promise<PaidAccountActivationResult> {
  const normalized = normalizeEmail(email);

  if (!(await userHasBillingAccess(normalized))) {
    return {
      ok: false,
      error:
        "Aucun abonnement actif pour cet email. Utilise la même adresse que sur Stripe.",
    };
  }

  const link = await generateActivationLink(normalized);
  const tokenHash = link.data?.properties?.hashed_token;
  const verificationType = link.data?.properties?.verification_type;
  const user = link.data?.user;

  if (!tokenHash || !verificationType || !user) {
    return { ok: false, error: "Impossible de préparer l'activation du compte." };
  }

  if (!userNeedsPasswordSetup(user)) {
    return {
      ok: false,
      error:
        "Un compte existe déjà pour cet email. Connecte-toi avec ton mot de passe sur la page Connexion.",
    };
  }

  await markPasswordSetupPending(user.id);

  const supabase = supabaseClient ?? (await createClient());
  const { error } = await supabase.auth.verifyOtp({
    type: verificationType as EmailOtpType,
    token_hash: tokenHash,
  });

  if (error) {
    console.error("[paid-account-activation] verifyOtp", error.message);
    return {
      ok: false,
      error: "Activation impossible pour le moment. Réessaie ou contacte le support.",
    };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email) {
    return {
      ok: false,
      error: "Session non créée. Réessaie l'activation.",
    };
  }

  return { ok: true, mode: "password-setup" };
}
