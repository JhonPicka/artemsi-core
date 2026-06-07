import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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

function isAlreadyRegistered(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("already") ||
    lower.includes("registered") ||
    lower.includes("exists")
  );
}

async function markPendingByEmail(email: string) {
  const admin = createAdminClient();
  const recovery = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: finishRedirectUrl() },
  });
  const userId = recovery.data.user?.id;
  if (userId) {
    await markPasswordSetupPending(userId);
  }
}

/** Envoi du lien d'activation via Supabase Auth (invite ou reset password). */
export async function sendAccountSetupEmail(email: string) {
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
    return { ok: true, method: "invite" as const };
  }

  if (!isAlreadyRegistered(invite.error.message)) {
    console.error("[account-setup] invite failed", invite.error.message);
    throw new Error(invite.error.message);
  }

  await markPendingByEmail(normalized);

  const supabase = await createClient();
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalized, {
    redirectTo,
  });

  if (resetError) {
    console.error("[account-setup] reset password email failed", resetError.message);
    throw new Error(resetError.message);
  }

  return { ok: true, method: "recovery" as const };
}
