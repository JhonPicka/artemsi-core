import type { User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export type AccountSetupResult = {
  ok: true;
  /** True when the user must open the email link and choose a password. */
  needsPasswordSetup: boolean;
  emailSent: boolean;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function finishRedirectUrl() {
  const appUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${appUrl}/auth/callback`;
}

function createAnonClient() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function userNeedsPasswordSetup(user: User): boolean {
  if (user.user_metadata?.password_setup_pending === true) return true;
  if (user.user_metadata?.password_set === true) return false;
  // Invited account: no sign-in yet → password not chosen.
  return !user.last_sign_in_at;
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

async function findAuthUserByEmail(email: string): Promise<User | null> {
  const admin = createAdminClient();
  const link = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: finishRedirectUrl() },
  });

  if (link.error) {
    const message = link.error.message.toLowerCase();
    if (message.includes("not found") || message.includes("no user")) {
      return null;
    }
    throw new Error(link.error.message);
  }

  return link.data.user ?? null;
}

async function sendRecoverySetupEmail(email: string, userId: string) {
  await markPasswordSetupPending(userId);
  const anon = createAnonClient();
  const { error } = await anon.auth.resetPasswordForEmail(email, {
    redirectTo: finishRedirectUrl(),
  });
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Envoie le lien d'activation via Supabase Auth.
 * - Nouveau compte : invite email
 * - Compte invité sans mot de passe : email recovery (invite échoue "already registered")
 * - Compte avec mot de passe : pas d'email
 */
export async function sendAccountSetupEmail(email: string): Promise<AccountSetupResult> {
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
    return { ok: true, needsPasswordSetup: true, emailSent: true };
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

  const existingUser = await findAuthUserByEmail(normalized);
  if (!existingUser) {
    throw new Error("Compte introuvable après invitation.");
  }

  if (!userNeedsPasswordSetup(existingUser)) {
    return { ok: true, needsPasswordSetup: false, emailSent: false };
  }

  await sendRecoverySetupEmail(normalized, existingUser.id);
  return { ok: true, needsPasswordSetup: true, emailSent: true };
}

/** Renvoi manuel du lien (bouton page succès). */
export async function resendActivationEmail(email: string): Promise<AccountSetupResult> {
  return sendAccountSetupEmail(email);
}

/** État réel du compte auth pour afficher la bonne page après paiement. */
export async function getPaidAccountSetupStatus(email: string): Promise<{
  needsPasswordSetup: boolean;
  hasAuthUser: boolean;
}> {
  const normalized = normalizeEmail(email);
  const user = await findAuthUserByEmail(normalized);

  if (!user) {
    return { needsPasswordSetup: true, hasAuthUser: false };
  }

  return {
    needsPasswordSetup: userNeedsPasswordSetup(user),
    hasAuthUser: true,
  };
}
