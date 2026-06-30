/**
 * Supprime les offres HelloWork qui ne matchent aucun profil « gardé »,
 * en conservant au minimum MIN_HELLOWORK_OFFERS.
 *
 * Usage: node scripts/prune-hellowork-offers.mjs [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const MIN_HELLOWORK_OFFERS = 50;
const DRY_RUN = process.argv.includes("--dry-run");

function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i);
    let val = t.slice(i + 1);
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const ADMIN_USER_ID = process.env.ADMIN_USER_ID?.trim();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// --- matching (copie légère de offer-matching.ts) ---
const REGION_HINTS = {
  "ile-de-france": ["paris", "la defense", "creteil", "versailles", "saint-denis", "idf"],
  "auvergne-rhone-alpes": ["lyon", "grenoble", "annecy", "clermont", "villeurbanne"],
  "hauts-de-france": ["lille", "amiens", "roubaix", "tourcoing", "arras"],
  "grand-est": ["strasbourg", "nancy", "metz", "reims", "mulhouse"],
  "nouvelle-aquitaine": ["bordeaux", "poitiers", "limoges", "pau", "bayonne", "biarritz"],
  occitanie: ["toulouse", "montpellier", "nimes", "perpignan"],
  "pays-de-la-loire": ["nantes", "angers", "le mans", "saint-nazaire"],
  bretagne: ["rennes", "brest", "lorient", "saint-brieuc", "vannes"],
  normandie: ["rouen", "caen", "le havre", "cherbourg"],
  "bourgogne-franche-comte": ["dijon", "besancon", "auxerre"],
  "centre-val-de-loire": ["orleans", "tours", "blois", "bourges"],
  "provence-alpes-cote-d'azur": ["marseille", "nice", "toulon", "aix", "cannes", "paca"],
  corse: ["ajaccio", "bastia", "corse"],
  "dom-tom": ["guadeloupe", "martinique", "guyane", "reunion", "mayotte", "polynesie"],
};

const DOMAIN_HINTS = {
  INFORMATIQUE: ["developpeur", "developer", "data", "devops", "informatique", "cyber", "software"],
  MARKETING: ["marketing", "growth", "seo", "sea", "acquisition", "brand"],
  COMMERCE: ["commercial", "vente", "business developer", "account manager", "prospection"],
  FINANCE: ["finance", "comptabilite", "controle de gestion", "audit", "banque"],
  RH: ["rh", "ressources humaines", "recrutement", "talent", "paie"],
  INGENIERIE: ["ingenieur", "ingenierie", "mecanique", "electrique", "electronique", "production"],
  DESIGN: ["design", "ux", "ui", "graphique", "product designer"],
  COMMUNICATION: ["communication", "relations presse", "community manager", "contenu"],
  DROIT: ["juriste", "droit", "compliance", "legal"],
  SANTE: ["sante", "medical", "pharma", "clinique", "hopital"],
  INDUSTRIE: ["industrie", "usine", "maintenance", "qualite"],
  LOGISTIQUE: ["logistique", "supply chain", "transport", "approvisionnement"],
};

const OFFER_MATCH_SCORE_THRESHOLD = 3;

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function offerHaystack(offer) {
  return `${offer.title} ${offer.company ?? ""} ${offer.location ?? ""} ${offer.summary}`;
}

function hasRegionMatch(profileRegions, haystack) {
  if (!profileRegions || profileRegions.length === 0) return true;
  const normText = normalize(haystack);
  for (const region of profileRegions) {
    const key = normalize(region);
    const hints = REGION_HINTS[key] ?? [];
    if (normText.includes(key)) return true;
    if (hints.some((h) => normText.includes(normalize(h)))) return true;
  }
  return false;
}

function profileOfferDomainCompatible(profileDomain, offerDomain) {
  if (!offerDomain) return true;
  if (!profileDomain || profileDomain === "AUTRE") return true;
  if (offerDomain === "AUTRE") return true;
  return profileDomain === offerDomain;
}

function domainScore(studyDomain, offer, haystack) {
  const offerDomain = offer.study_domain;
  if (offerDomain) {
    if (!profileOfferDomainCompatible(studyDomain, offerDomain)) return 0;
    if (
      studyDomain &&
      studyDomain !== "AUTRE" &&
      offerDomain !== "AUTRE" &&
      studyDomain === offerDomain
    ) {
      return 3;
    }
    return 1;
  }
  if (!studyDomain || studyDomain === "AUTRE") return 0;
  const hints = DOMAIN_HINTS[studyDomain] ?? [];
  const text = normalize(haystack);
  return hints.some((h) => text.includes(normalize(h))) ? 1 : 0;
}

function contractScore(contractType, haystack) {
  if (!contractType) return 0;
  const text = normalize(haystack);
  if (contractType === "ALTERNANCE") return text.includes("alternance") ? 2 : 0;
  if (contractType === "APPRENTISSAGE")
    return text.includes("apprentissage") || text.includes("apprenti") ? 2 : 0;
  if (contractType === "PRO")
    return text.includes("contrat pro") || text.includes("professionnalisation") ? 2 : 0;
  return 0;
}

function jobScore(targetJob, haystack) {
  if (!targetJob) return 0;
  const text = normalize(haystack);
  const tokens = normalize(targetJob)
    .split(/\s+/)
    .filter((t) => t.length >= 3);
  let score = 0;
  for (const token of tokens) {
    if (text.includes(token)) score += 2;
  }
  return Math.min(score, 8);
}

function computeOfferMatchScore(profile, offer) {
  const haystack = offerHaystack(offer);
  if (!hasRegionMatch(profile.regions, haystack)) return 0;
  if (!profileOfferDomainCompatible(profile.study_domain, offer.study_domain)) return 0;
  return (
    jobScore(profile.target_job, haystack) +
    contractScore(profile.contract_type, haystack) +
    domainScore(profile.study_domain, offer, haystack)
  );
}

function profileMatchesOffer(profile, offer) {
  return computeOfferMatchScore(profile, offer) >= OFFER_MATCH_SCORE_THRESHOLD;
}

function bestScoreForOffer(offer, profiles) {
  let best = 0;
  for (const profile of profiles) {
    best = Math.max(best, computeOfferMatchScore(profile, offer));
  }
  return best;
}

function isHellowork(url) {
  return (url ?? "").toLowerCase().includes("hellowork");
}

async function main() {
  const { data: profileRows, error: pErr } = await supabase
    .from("profiles")
    .select("id, target_job, regions, contract_type, study_domain, onboarding_completed, full_name")
    .eq("onboarding_completed", true);

  if (pErr) throw new Error(pErr.message);

  const profiles = (profileRows ?? [])
    .filter((p) => p.id !== ADMIN_USER_ID)
    .map((p) => ({
      id: p.id,
      full_name: p.full_name,
      target_job: p.target_job,
      regions: p.regions,
      contract_type: p.contract_type,
      study_domain: p.study_domain,
    }));

  const { data: offerRows, error: oErr } = await supabase
    .from("offers")
    .select("id, title, company, location, description, url, study_domain, created_at")
    .is("hidden_at", null);

  if (oErr) throw new Error(oErr.message);

  const hellowork = (offerRows ?? []).filter((o) => isHellowork(o.url));
  const offers = hellowork.map((row) => ({
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    summary: row.description ?? "",
    study_domain: row.study_domain,
    url: row.url,
    created_at: row.created_at,
  }));

  const scored = offers.map((offer) => {
    const matches = profiles.filter((p) => profileMatchesOffer(p, offer));
    const bestScore = bestScoreForOffer(offer, profiles);
    return { offer, matches, bestScore, isMatch: matches.length > 0 };
  });

  const matching = scored.filter((s) => s.isMatch);
  const nonMatching = scored
    .filter((s) => !s.isMatch)
    .sort((a, b) => b.bestScore - a.bestScore || b.offer.created_at.localeCompare(a.offer.created_at));

  const toKeep = [...matching];
  if (toKeep.length < MIN_HELLOWORK_OFFERS) {
    const need = MIN_HELLOWORK_OFFERS - toKeep.length;
    toKeep.push(...nonMatching.slice(0, need));
  }

  const keepIds = new Set(toKeep.map((s) => s.offer.id));
  const toDelete = scored.filter((s) => !keepIds.has(s.offer.id));

  console.log("Profils gardés (hors admin):", profiles.length);
  for (const p of profiles) {
    console.log(`  - ${p.full_name} | ${p.study_domain ?? "—"} | ${(p.regions ?? []).join(", ")}`);
  }
  console.log("\nHelloWork total:", hellowork.length);
  console.log("Matchent au moins 1 profil:", matching.length);
  console.log("À conserver:", keepIds.size, `(min ${MIN_HELLOWORK_OFFERS})`);
  console.log("À supprimer:", toDelete.length);

  if (toDelete.length === 0) {
    console.log("\nRien à supprimer.");
    return;
  }

  if (DRY_RUN) {
    console.log("\n[DRY RUN] Exemples à supprimer:");
    for (const s of toDelete.slice(0, 10)) {
      console.log(`  - ${s.offer.title} (score max ${s.bestScore})`);
    }
    return;
  }

  const BATCH = 30;
  let deleted = 0;
  for (let i = 0; i < toDelete.length; i += BATCH) {
    const batch = toDelete.slice(i, i + BATCH).map((s) => s.offer.id);
    const { error } = await supabase.from("offers").delete().in("id", batch);
    if (error) throw new Error(error.message);
    deleted += batch.length;
    console.log(`Supprimé ${deleted}/${toDelete.length}...`);
  }

  console.log("\nTerminé. HelloWork restantes:", keepIds.size);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
