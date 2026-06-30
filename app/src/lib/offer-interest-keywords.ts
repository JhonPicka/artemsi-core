const STOPWORDS = new Set([
  "alternance",
  "apprentissage",
  "stage",
  "contrat",
  "junior",
  "assistant",
  "charge",
  "offre",
  "emploi",
  "poste",
  "france",
  "paris",
  "lyon",
  "h/f",
  "hf",
  "cdd",
  "cdi",
]);

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Extrait des mots-cles depuis le titre / description d'une offre. */
export function extractKeywordsFromOffer(input: {
  title: string;
  company?: string | null;
  description?: string | null;
}): string[] {
  const raw = `${input.title} ${input.company ?? ""} ${input.description ?? ""}`;
  const tokens = normalize(raw)
    .replace(/[^a-z0-9+.#/ -]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !STOPWORDS.has(t));

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const token of tokens) {
    if (seen.has(token)) continue;
    seen.add(token);
    unique.push(token);
    if (unique.length >= 10) break;
  }
  return unique;
}

const MAX_KEYWORDS = 40;

export function mergeInterestKeywords(
  existing: string[] | null | undefined,
  added: string[],
): string[] {
  const merged: string[] = [];
  const seen = new Set<string>();

  for (const kw of [...(existing ?? []), ...added]) {
    const n = normalize(kw);
    if (n.length < 4 || STOPWORDS.has(n)) continue;
    if (seen.has(n)) continue;
    seen.add(n);
    merged.push(n);
    if (merged.length >= MAX_KEYWORDS) break;
  }

  return merged;
}

export function removeInterestKeywords(
  existing: string[] | null | undefined,
  removed: string[],
): string[] {
  const removeSet = new Set(removed.map(normalize));
  return (existing ?? []).filter((kw) => !removeSet.has(normalize(kw)));
}
