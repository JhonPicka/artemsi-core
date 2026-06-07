import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function finishRedirectUrl() {
  const next = encodeURIComponent("/signup/finish");
  const appUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${appUrl}/auth/callback?next=${next}`;
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

/**
 * Envoie le lien d'activation via Supabase Auth.
 * - Nouveau compte : invite email
 * - Compte existant : ne rien envoyer (l'utilisateur se connecte sur /login)
 */
export async function sendAccountSetupEmail(
  email: string,
): Promise<{ ok: true; isNewAccount: boolean }> {
  const normalized = normalizeEmail(email);
  const redirectTo = finishRedirectUrl();
  const admin = createAdminClient();

  const invite = await admin.auth.admin.inviteUserByEmail(normalized, {
    redirectTo,
  });

  if (!invite.error) {
    const userId = invite.data.user?.id;
    if (userId) {
      await markPasswordSetupPending(userId);
    }
    return { ok: true, isNewAccount: true };
  }

  const message = invite.error.message.toLowerCase();
  const alreadyRegistered =
    message.includes("already") ||
    message.includes("registered") ||
    message.includes("exists");

  if (!alreadyRegistered) {
    console.error("[account-setup] invite failed", invite.error.message);
    throw new Error(invite.error.message);
  }

  // Compte existant — on ne renvoie pas d'email, l'utilisateur se connecte sur /login
  return { ok: true, isNewAccount: false };
}

/**
 * Renvoi manuel du lien (bouton page succès).
 * Uniquement pour les nouveaux comptes — si le compte existe déjà, on pointe vers /login.
 */
export async function resendActivationEmail(
  email: string,
): Promise<{ ok: true; isNewAccount: boolean }> {
  const normalized = normalizeEmail(email);
  const admin = createAdminClient();
  const redirectTo = finishRedirectUrl();

  const invite = await admin.auth.admin.inviteUserByEmail(normalized, {
    redirectTo,
  });

  if (!invite.error) {
    const userId = invite.data.user?.id;
    if (userId) {
      await markPasswordSetupPending(userId);
    }
    return { ok: true, isNewAccount: true };
  }

  const message = invite.error.message.toLowerCase();
  const alreadyRegistered =
    message.includes("already") ||
    message.includes("registered") ||
    message.includes("exists");

  if (!alreadyRegistered) {
    throw new Error(invite.error.message);
  }

  return { ok: true, isNewAccount: false };
}
