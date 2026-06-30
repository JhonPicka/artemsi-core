import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(root, "..", ".env.local");
const appPort = process.env.PORT || "3000";

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

const env = loadEnv();
const token = env.LBA_API_TOKEN?.trim();
const cronSecret = env.CRON_SECRET?.trim();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const adminId = env.ADMIN_USER_ID?.trim();
const localBase = `http://localhost:${appPort}`;

console.log("\n=== Test import LBA ===\n");

if (!token) {
  console.error("KO  LBA_API_TOKEN vide — enregistre .env.local puis relance.");
  process.exit(1);
}
console.log("OK  LBA_API_TOKEN present");

const searchUrl =
  "https://api.apprentissage.beta.gouv.fr/api/job/v1/search?latitude=48.8566&longitude=2.3522&radius=50&romes=M1805&limit=3";

const apiRes = await fetch(searchUrl, {
  headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
});
const apiBody = await apiRes.text();
console.log(`1) API LBA directe : HTTP ${apiRes.status}`);
if (!apiRes.ok) {
  console.log(apiBody.slice(0, 500));
  process.exit(1);
}
console.log("   Reponse OK (token valide)\n");

if (supabaseUrl && serviceKey && adminId) {
  const profileRes = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${adminId}&select=study_domain,regions,target_job`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    },
  );
  const profile = (await profileRes.json())[0];
  console.log("2) Profil admin :");
  console.log(
    `   domaine=${profile?.study_domain ?? "vide"} · regions=${JSON.stringify(profile?.regions ?? [])}`,
  );
  if (!profile?.regions?.length || !profile?.study_domain) {
    console.log(
      "   WARN Pour « Mon profil admin », complete region + domaine dans /admin ou utilise « Tous les profils ».\n",
    );
  } else {
    console.log("");
  }

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
  await fetch(`${supabaseUrl}/rest/v1/lba_import_daily_decisions`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      import_date: today,
      approved: true,
      decided_at: new Date().toISOString(),
      decided_by: adminId,
    }),
  });
  console.log(`3) Validation du jour (${today}) : OK pour test cron\n`);
}

if (!cronSecret) {
  console.log("4) CRON_SECRET manquant — lance l'import via l'UI admin.\n");
  process.exit(0);
}

let devReady = false;
for (let i = 0; i < 30; i++) {
  try {
    const ping = await fetch(localBase, { signal: AbortSignal.timeout(2000) });
    if (ping.ok || ping.status === 307 || ping.status === 308) {
      devReady = true;
      break;
    }
  } catch {
    // server not up yet
  }
  await new Promise((r) => setTimeout(r, 1000));
}

if (!devReady) {
  console.log(
    `4) Serveur local absent sur ${localBase} — lance "npm run dev" puis /admin/offres/import\n`,
  );
  process.exit(0);
}

const cronRes = await fetch(`${localBase}/api/cron/offers-import`, {
  headers: { Authorization: `Bearer ${cronSecret}` },
});
const cronBody = await cronRes.text();
console.log(`4) Cron local offers-import : HTTP ${cronRes.status}`);
try {
  const json = JSON.parse(cronBody);
  const imp = json.import ?? {};
  console.log(
    `   inserted=${imp.inserted ?? 0} · updated=${imp.updated ?? 0} · accepted=${imp.accepted ?? 0} · fetched=${imp.fetched ?? 0}`,
  );
  console.log(
    `   skippedNoProfileMatch=${imp.skippedNoProfileMatch ?? 0} · profiles=${imp.profilesConsidered ?? 0}`,
  );
  if (json.skipped) console.log(`   skipped: ${json.reason}`);
  if (imp.errors?.length) console.log(`   errors: ${imp.errors.join(" | ")}`);
} catch {
  console.log(cronBody.slice(0, 800));
}

console.log("\nUI : http://localhost:3000/admin/offres/import → « Tous les profils » + Lancer l'import LBA\n");
