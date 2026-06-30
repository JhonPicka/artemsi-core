import type { SupabaseClient } from "@supabase/supabase-js";

import { userNeedsPasswordSetup } from "@/lib/account-setup";
import { userHasBillingAccess } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSetupToken, verifySetupToken } from "@/lib/setup-token";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function findAuthUserByEmail(email: string) {
  const admin = createAdminClient();
  const normalized = normalizeEmail(email);
  let page = 1;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      throw new Error(error.message);
    }

    const match = data.users.find((user) => user.email?.toLowerCase() === normalized);
    if (match) {
      return match;
    }

    if (data.users.length < 200) {
      break;
    }
    page += 1;
  }

  return null;
}

async function ensureAuthUser(email: string) {
  const admin = createAdminClient();
  const normalized = normalizeEmail(email);
  const existing = await findAuthUserByEmail(normalized);
  if (existing) {
    return existing;
  }

  const invite = await admin.auth.admin.inviteUserByEmail(normalized, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://artemsi.fr"}/auth/confirm`,
  });

  if (!invite.error && invite.data.user) {
    return invite.data.user;
  }

  const message = invite.error?.message.toLowerCase() ?? "";
  if (
    message.includes("already") ||
    message.includes("registered") ||
    message.includes("exists")
  ) {
    return findAuthUserByEmail(normalized);
  }

  if (invite.error) {
    throw new Error(invite.error.message);
  }

  return null;
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

export type PaidAccountActivationResult =
  | { ok: true; setupToken: string; email: string }
  | { ok: false; error: string };

/**
 * Prépare la création de mot de passe pour un payeur (sans dépendre des cookies session).
 */
export async function preparePaidAccountPasswordSetup(
  email: string,
): Promise<PaidAccountActivationResult> {
  const normalized = normalizeEmail(email);

  if (!(await userHasBillingAccess(normalized))) {
    return {
      ok: false,
      error:
        "Aucun abonnement actif pour cet email. Utilise la même adresse que sur Stripe.",
    };
  }

  const user = await ensureAuthUser(normalized);
  if (!user?.id || !user.email) {
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

  return {
    ok: true,
    setupToken: createSetupToken({ email: user.email, userId: user.id }),
    email: user.email,
  };
}

export type FinishSignupWithTokenResult =
  | { ok: true; email: string }
  | { ok: false; error: string };

/** Définit le mot de passe via admin API puis ouvre une session (cookies sur la réponse). */
export async function finishSignupWithToken(
  params: { setupToken: string; password: string },
  supabase: SupabaseClient,
): Promise<FinishSignupWithTokenResult> {
  const payload = verifySetupToken(params.setupToken);
  if (!payload) {
    return { ok: false, error: "Lien d'activation expiré. Relance « Activer mon compte »." };
  }

  const admin = createAdminClient();
  const { error: updateError } = await admin.auth.admin.updateUserById(payload.userId, {
    password: params.password,
    user_metadata: {
      password_setup_pending: false,
      password_set: true,
    },
  });

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: params.password,
  });

  if (signInError) {
    return {
      ok: false,
      error: "Mot de passe enregistré, mais connexion impossible. Réessaie de te connecter.",
    };
  }

  return { ok: true, email: payload.email };
}
