import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(root, "..", ".env.local");

function loadEnv() {
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

function normalizeApplicationUrlForDedup(url) {
  try {
    const parsed = new URL(url.trim());
    parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    for (const key of [...parsed.searchParams.keys()]) {
      if (key.startsWith("utm_")) parsed.searchParams.delete(key);
    }
    parsed.hash = "";
    const sorted = new URLSearchParams([...parsed.searchParams.entries()].sort());
    parsed.search = sorted.toString();
    let normalized = parsed.toString();
    if (normalized.endsWith("/")) normalized = normalized.slice(0, -1);
    return normalized;
  } catch {
    return url.trim().toLowerCase();
  }
}

const env = loadEnv();
const base = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

const res = await fetch(
  `${base}/rest/v1/offers?external_key=like.lba:*&select=id,url,external_key,created_at&order=created_at.asc`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } },
);
const offers = await res.json();

const byUrl = new Map();
for (const offer of offers) {
  if (!offer.url) continue;
  const norm = normalizeApplicationUrlForDedup(offer.url);
  const list = byUrl.get(norm) ?? [];
  list.push(offer);
  byUrl.set(norm, list);
}

const toDelete = [];
for (const [, group] of byUrl) {
  if (group.length <= 1) continue;
  const sorted = [...group].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  for (const row of sorted.slice(1)) toDelete.push(row.id);
}

for (const offer of offers) {
  if (!offer.url) continue;
  try {
    if (new URL(offer.url).hostname.toLowerCase().includes("leboncoin")) {
      toDelete.push(offer.id);
    }
  } catch {
    // ignore
  }
}

const uniqueDelete = [...new Set(toDelete)];
console.log(`Suppression de ${uniqueDelete.length} offre(s) LBA (doublons URL + Leboncoin).`);

for (const id of uniqueDelete) {
  const del = await fetch(`${base}/rest/v1/offers?id=eq.${id}`, {
    method: "DELETE",
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!del.ok) console.error("DELETE failed", id, await del.text());
}

const remaining = await fetch(`${base}/rest/v1/offers?external_key=like.lba:*&select=id`, {
  headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" },
});
console.log(`Reste : ${remaining.headers.get("content-range")?.split("/")[1] ?? "?"} offres LBA.`);
