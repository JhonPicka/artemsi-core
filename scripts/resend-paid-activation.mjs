import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(root, "..", ".env.local");

function loadEnv() {
  if (!fs.existsSync(envPath)) {
    throw new Error("Fichier manquant : app/.env.local");
  }
  return Object.fromEntries(
    fs
      .readFileSync(envPath, "utf8")
      .split("\n")
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const i = line.indexOf("=");
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      }),
  );
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function finishRedirectUrl(appUrl) {
  return `${appUrl}/auth/callback`;
}

function userNeedsPasswordSetup(user) {
  if (user.user_metadata?.password_setup_pending === true) return true;
  if (user.user_metadata?.password_set === true) return false;
  return !user.last_sign_in_at;
}

function loadBypassEmails(env) {
  const emails = new Set();
  for (const raw of (env.BILLING_BYPASS_EMAILS ?? "").split(",")) {
    const normalized = raw.trim().toLowerCase();
    if (normalized) emails.add(normalized);
  }
  if (env.ADMIN_EMAIL) {
    emails.add(env.ADMIN_EMAIL.trim().toLowerCase());
  }
  return emails;
}

async function markPasswordSetupPending(admin, userId) {
  await admin.auth.admin.updateUserById(userId, {
    user_metadata: {
      password_setup_pending: true,
      password_set: false,
    },
  });
}

async function findAuthUserByEmail(admin, email, redirectTo) {
  const link = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
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

async function sendRecoverySetupEmail(admin, anon, email, userId, redirectTo) {
  await markPasswordSetupPending(admin, userId);
  const { error } = await anon.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw new Error(error.message);
}

async function sendAccountSetupEmail(admin, anon, email, redirectTo) {
  const normalized = normalizeEmail(email);

  const invite = await admin.auth.admin.inviteUserByEmail(normalized, { redirectTo });

  if (!invite.error) {
    const userId = invite.data.user?.id;
    if (userId) await markPasswordSetupPending(admin, userId);
    return { needsPasswordSetup: true, emailSent: true, mode: "invite" };
  }

  const message = invite.error.message.toLowerCase();
  const alreadyRegistered =
    message.includes("already") ||
    message.includes("registered") ||
    message.includes("exists");

  if (!alreadyRegistered) {
    throw new Error(invite.error.message);
  }

  const existingUser = await findAuthUserByEmail(admin, normalized, redirectTo);
  if (!existingUser) {
    throw new Error("Compte introuvable après invitation.");
  }

  if (!userNeedsPasswordSetup(existingUser)) {
    return { needsPasswordSetup: false, emailSent: false, mode: "skip-has-password" };
  }

  await sendRecoverySetupEmail(admin, anon, normalized, existingUser.id, redirectTo);
  return { needsPasswordSetup: true, emailSent: true, mode: "recovery" };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const appUrl = env.NEXT_PUBLIC_APP_URL ?? "https://artemsi.fr";
const dryRun = process.argv.includes("--dry-run");

if (!url || !serviceKey || !anonKey) {
  console.error("Variables manquantes : SUPABASE URL / SERVICE_ROLE / ANON_KEY");
  process.exit(1);
}

const bypass = loadBypassEmails(env);
const redirectTo = finishRedirectUrl(appUrl);
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const anon = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log(`\n=== Renvoi emails activation (payeurs actifs) ===`);
console.log(`App URL: ${appUrl}`);
console.log(`Mode: ${dryRun ? "DRY-RUN (aucun envoi)" : "ENVOI RÉEL"}\n`);

const { data: rows, error } = await admin
  .from("billing_customers")
  .select("email, subscription_status, updated_at")
  .eq("subscription_status", "active")
  .order("updated_at", { ascending: false });

if (error) {
  console.error("Erreur lecture billing_customers:", error.message);
  process.exit(1);
}

const emails = [...new Set((rows ?? []).map((r) => normalizeEmail(r.email)).filter(Boolean))];
console.log(`Payeurs actifs trouvés : ${emails.length}\n`);

const results = { sent: 0, skippedBypass: 0, skippedHasPassword: 0, errors: 0 };

for (const email of emails) {
  if (bypass.has(email)) {
    console.log(`SKIP (bypass)  ${email}`);
    results.skippedBypass += 1;
    continue;
  }

  if (dryRun) {
    console.log(`DRY-RUN        ${email}`);
    continue;
  }

  try {
    const result = await sendAccountSetupEmail(admin, anon, email, redirectTo);
    if (result.emailSent) {
      console.log(`ENVOYÉ (${result.mode})  ${email}`);
      results.sent += 1;
    } else {
      console.log(`SKIP (mot de passe déjà choisi)  ${email}`);
      results.skippedHasPassword += 1;
    }
    await sleep(1200);
  } catch (cause) {
    console.error(`ERREUR  ${email} — ${cause instanceof Error ? cause.message : cause}`);
    results.errors += 1;
  }
}

console.log("\n--- Résumé ---");
console.log(`Emails envoyés      : ${results.sent}`);
console.log(`Ignorés (bypass)    : ${results.skippedBypass}`);
console.log(`Ignorés (déjà actif): ${results.skippedHasPassword}`);
console.log(`Erreurs             : ${results.errors}\n`);
