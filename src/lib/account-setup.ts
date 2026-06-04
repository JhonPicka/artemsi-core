import { getAppUrl, sendEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function finishRedirectUrl() {
  const next = encodeURIComponent("/signup/finish");
  return `${getAppUrl()}/auth/callback?next=${next}`;
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

/** Lien Supabase (invite ou recovery) pour ouvrir /signup/finish avec session. */
export async function createAccountSetupLink(email: string): Promise<string | null> {
  const admin = createAdminClient();
  const normalized = normalizeEmail(email);
  const redirectTo = finishRedirectUrl();

  const invite = await admin.auth.admin.generateLink({
    type: "invite",
    email: normalized,
    options: { redirectTo },
  });

  if (!invite.error && invite.data.properties?.action_link) {
    const userId = invite.data.user?.id;
    if (userId) {
      await markPasswordSetupPending(userId);
    }
    return invite.data.properties.action_link;
  }

  const message = invite.error?.message?.toLowerCase() ?? "";
  const alreadyRegistered =
    message.includes("already") ||
    message.includes("registered") ||
    message.includes("exists");

  if (!alreadyRegistered) {
    console.error("[account-setup] invite link failed", invite.error?.message);
    return null;
  }

  const recovery = await admin.auth.admin.generateLink({
    type: "recovery",
    email: normalized,
    options: { redirectTo },
  });

  if (!recovery.error && recovery.data.properties?.action_link) {
    const userId = recovery.data.user?.id;
    if (userId) {
      await markPasswordSetupPending(userId);
    }
    return recovery.data.properties.action_link;
  }

  console.error("[account-setup] recovery link failed", recovery.error?.message);
  return null;
}

function setupEmailHtml(params: {
  setupLink: string | null;
  normalized: string;
  fallbackSignupUrl: string;
  loginUrl: string;
}) {
  const { setupLink, normalized, fallbackSignupUrl, loginUrl } = params;

  if (!setupLink) {
    return `
      <p>Ton paiement ARTEMSI a bien été confirmé.</p>
      <p>
        Pour activer ton accès, choisis ton mot de passe ici :
        <a href="${fallbackSignupUrl}"><strong>Choisir mon mot de passe</strong></a>
      </p>
      <p style="font-size:14px;color:#666;">
        Utilise <strong>exactement le même email</strong> que sur Stripe : ${normalized}
      </p>
      <p style="font-size:14px;color:#666;">
        Déjà un compte ? <a href="${loginUrl}">Se connecter</a>
      </p>
    `;
  }

  return `
    <p>Ton abonnement ARTEMSI est actif.</p>
    <p>
      Clique sur le lien ci-dessous pour confirmer ton email
      (<strong>${normalized}</strong>) et choisir ton mot de passe :
    </p>
    <p>
      <a href="${setupLink}"><strong>Confirmer et choisir mon mot de passe</strong></a>
    </p>
    <p style="font-size:14px;color:#666;">
      Ce lien est personnel. Si le bouton ne fonctionne pas, copie-colle l'URL dans ton navigateur.
    </p>
    <p style="font-size:14px;color:#666;">
      Secours : <a href="${fallbackSignupUrl}">choisir mon mot de passe sans email</a>
      · <a href="${loginUrl}">Se connecter</a>
    </p>
  `;
}

/** Envoi du lien d'activation (webhook Stripe uniquement en prod — évite les doublons). */
export async function sendAccountSetupEmail(email: string) {
  const normalized = normalizeEmail(email);
  const setupLink = await createAccountSetupLink(normalized);
  const appUrl = getAppUrl();
  const fallbackSignupUrl = `${appUrl}/signup?email=${encodeURIComponent(normalized)}`;
  const loginUrl = `${appUrl}/login?email=${encodeURIComponent(normalized)}`;

  await sendEmail({
    to: normalized,
    subject: setupLink
      ? "ARTEMSI — confirme ton email et choisis ton mot de passe"
      : "Ton abonnement ARTEMSI est actif — crée ton mot de passe",
    html: setupEmailHtml({ setupLink, normalized, fallbackSignupUrl, loginUrl }),
  });

  return { ok: true, usedInviteLink: Boolean(setupLink) } as const;
}
