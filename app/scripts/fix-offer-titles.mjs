import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sanitizeOfferTitle } from "../src/lib/offer-title-sanitize.ts";

const root = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, "..", ".env.local"), "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
);

const base = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

const res = await fetch(`${base}/rest/v1/offers?select=id,title&limit=2000`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
const offers = await res.json();

let updated = 0;
for (const offer of offers) {
  const next = sanitizeOfferTitle(offer.title);
  if (next === offer.title) continue;
  const patch = await fetch(`${base}/rest/v1/offers?id=eq.${offer.id}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ title: next }),
  });
  if (patch.ok) {
    updated += 1;
    console.log(`• ${offer.title}`);
    console.log(`  → ${next}\n`);
  }
}

console.log(`${updated} titre(s) corrigé(s) sur ${offers.length} offre(s).`);
