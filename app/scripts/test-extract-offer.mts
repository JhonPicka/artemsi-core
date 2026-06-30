import { readFileSync } from "fs";

function loadEnv(path: string) {
  const env: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
  for (const [k, v] of Object.entries(env)) {
    process.env[k] = v;
  }
}

const pastedText = process.argv[2];
if (!pastedText) {
  console.error("Usage: npx tsx scripts/test-extract-offer.mts '<texte annonce>'");
  process.exit(1);
}

loadEnv(".env.local");

const { extractOfferFieldsFromUrl } = await import("../src/lib/offer-page-extract");

const result = await extractOfferFieldsFromUrl({
  url: "https://carrieres.kpmg.fr/alternance-audit-exemple",
  pastedText,
});

console.log(JSON.stringify(result, null, 2));
