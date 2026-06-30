import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(root, "..", ".env.local");

if (!fs.existsSync(envPath)) {
  console.error("Fichier manquant : app/.env.local");
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
);

const sk = env.STRIPE_SECRET_KEY ?? "";
const price = env.STRIPE_PRICE_ID ?? "";
const wh = env.STRIPE_WEBHOOK_SECRET ?? "";

let ok = true;

function row(label, pass, detail) {
  console.log(`${pass ? "OK" : "KO"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!pass) ok = false;
}

console.log("\n=== Verification Stripe (.env.local) ===\n");

row(
  "STRIPE_SECRET_KEY",
  /^sk_(test|live)_/.test(sk) && sk.length > 50,
  sk
    ? `prefixe ${sk.slice(0, 8)}..., longueur ${sk.length}`
    : "vide — colle sk_test_... depuis le dashboard",
);
row("STRIPE_PRICE_ID", /^price_/.test(price), price ? price.slice(0, 16) + "..." : "vide");
row("STRIPE_WEBHOOK_SECRET", /^whsec_/.test(wh), wh ? "present" : "optionnel en local sans stripe listen");
row("NEXT_PUBLIC_APP_URL", Boolean(env.NEXT_PUBLIC_APP_URL), env.NEXT_PUBLIC_APP_URL ?? "vide");
row("SUPABASE_SERVICE_ROLE_KEY", Boolean(env.SUPABASE_SERVICE_ROLE_KEY), "requis pour webhook");

console.log(ok ? "\nPret pour npm run dev + test checkout.\n" : "\nCorrige les lignes KO puis relance.\n");
process.exit(ok ? 0 : 1);
