/**
 * Extraction déterministe (sans IA) : JSON-LD, meta HTML, structure du texte collé.
 */

export type StructuredOfferHints = {
  title: string | null;
  company: string | null;
  location: string | null;
  rawDescription: string | null;
  contractHint: "alternance" | "apprentissage" | "pro" | null;
  confidence: "high" | "medium" | "low";
  sources: string[];
};

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function stripHtml(html: string) {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function metaContent(html: string, property: string) {
  const regex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const alt = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    "i",
  );
  return decodeHtmlEntities(html.match(regex)?.[1] ?? html.match(alt)?.[1] ?? "").trim();
}

function parseJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1] ?? "");
      blocks.push(parsed);
    } catch {
      // ignore invalid JSON-LD
    }
  }
  return blocks;
}

function collectJobPostings(node: unknown, out: Record<string, unknown>[]) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const item of node) collectJobPostings(item, out);
    return;
  }
  if (typeof node !== "object") return;

  const obj = node as Record<string, unknown>;
  const type = obj["@type"];
  const types = Array.isArray(type) ? type : type ? [type] : [];
  if (types.some((t) => String(t).toLowerCase() === "jobposting")) {
    out.push(obj);
  }
  if (obj["@graph"]) collectJobPostings(obj["@graph"], out);
}

function readOrgName(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "object" && value && "name" in value) {
    const name = (value as { name?: unknown }).name;
    return typeof name === "string" ? name.trim() || null : null;
  }
  return null;
}

function readJobLocation(value: unknown): string | null {
  if (!value) return null;
  const nodes = Array.isArray(value) ? value : [value];
  for (const node of nodes) {
    if (typeof node === "string") return node.trim() || null;
    if (typeof node !== "object" || !node) continue;
    const obj = node as Record<string, unknown>;
    const address = obj.address as Record<string, unknown> | undefined;
    if (address) {
      const locality = typeof address.addressLocality === "string" ? address.addressLocality : "";
      const region = typeof address.addressRegion === "string" ? address.addressRegion : "";
      const postal = typeof address.postalCode === "string" ? address.postalCode : "";
      const parts = [locality, postal ? `(${postal.slice(0, 2)})` : region].filter(Boolean);
      if (parts.length) return parts.join(" ").trim();
    }
    if (typeof obj.name === "string") return obj.name.trim();
  }
  return null;
}

function detectContractHint(text: string): StructuredOfferHints["contractHint"] {
  if (/apprentissage|apprenti/i.test(text)) return "apprentissage";
  if (/contrat pro|professionnalisation/i.test(text)) return "pro";
  if (/alternance/i.test(text)) return "alternance";
  return null;
}

function parseTitleCompanyFromOgTitle(ogTitle: string): { title: string | null; company: string | null } {
  const cleaned = ogTitle.replace(/\s+/g, " ").trim();
  const separators = [" | ", " - ", " – ", " — ", " chez ", " at "];
  for (const sep of separators) {
    const idx = cleaned.indexOf(sep);
    if (idx > 8 && idx < 80) {
      const left = cleaned.slice(0, idx).trim();
      const right = cleaned.slice(idx + sep.length).trim();
      if (right.length >= 2 && right.length <= 60 && !/recrutement|emploi|carri[eè]res/i.test(right)) {
        return { title: left, company: right.replace(/\s*[-|].*$/, "").trim() };
      }
    }
  }
  return { title: cleaned.length >= 8 ? cleaned : null, company: null };
}

export function extractStructuredOfferFromHtml(html: string): StructuredOfferHints {
  const hints: StructuredOfferHints = {
    title: null,
    company: null,
    location: null,
    rawDescription: null,
    contractHint: null,
    confidence: "low",
    sources: [],
  };

  const postings: Record<string, unknown>[] = [];
  for (const block of parseJsonLdBlocks(html)) {
    collectJobPostings(block, postings);
  }

  const posting = postings[0];
  if (posting) {
    if (typeof posting.title === "string") {
      hints.title = posting.title.trim();
      hints.sources.push("json-ld:title");
    }
    const org = readOrgName(posting.hiringOrganization);
    if (org) {
      hints.company = org;
      hints.sources.push("json-ld:company");
    }
    const loc = readJobLocation(posting.jobLocation);
    if (loc) {
      hints.location = loc;
      hints.sources.push("json-ld:location");
    }
    if (typeof posting.description === "string") {
      hints.rawDescription = stripHtml(posting.description).slice(0, 8000);
      hints.sources.push("json-ld:description");
    }
    if (posting.employmentType) {
      const et = String(posting.employmentType).toLowerCase();
      if (et.includes("apprentice")) hints.contractHint = "apprentissage";
      else if (et.includes("intern")) hints.contractHint = "alternance";
    }
    hints.confidence = "high";
  }

  const ogTitle = metaContent(html, "og:title");
  const ogSite = metaContent(html, "og:site_name");
  if (!hints.title && ogTitle) {
    const parsed = parseTitleCompanyFromOgTitle(ogTitle);
    hints.title = parsed.title;
    if (!hints.company) hints.company = parsed.company;
    hints.sources.push("meta:og:title");
    if (hints.confidence === "low") hints.confidence = "medium";
  }
  if (!hints.company && ogSite && ogSite.length <= 60) {
    hints.company = ogSite;
    hints.sources.push("meta:og:site_name");
  }

  const titleTag = decodeHtmlEntities(html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "");
  if (!hints.title && titleTag) {
    const parsed = parseTitleCompanyFromOgTitle(titleTag);
    hints.title = parsed.title;
    if (!hints.company) hints.company = parsed.company;
    hints.sources.push("meta:title");
    if (hints.confidence === "low") hints.confidence = "medium";
  }

  if (!hints.contractHint) {
    hints.contractHint = detectContractHint(
      `${hints.title ?? ""} ${hints.rawDescription ?? ""} ${ogTitle}`,
    );
  }

  return hints;
}

const PASTED_NOISE_LINE_PATTERNS = [
  /^et si cette alternance/i,
  /^vous cherchez une alternance/i,
  /^vous reconnaissez dans le profil/i,
  /^how you met your job/i,
  /opens in new window/i,
  /^postuler\b/i,
  /^partager\b/i,
  /^cookie/i,
  /^mentions l[eé]gales/i,
  /^offres similaires/i,
  /^hellowork\b/i,
  /^indeed\b/i,
  /^linkedin\b/i,
];

const PASTED_NOISE_INLINE = [
  /Et si cette alternance était faite pour vous\s*\??/gi,
  /Vous cherchez une alternance de \d+ ou \d+ mois et vous reconnaissez dans le profil suivant\s*:?/gi,
  /\(opens in new window\)/gi,
  /How You Met Your Job\.?/gi,
];

/** Nettoie le texte collé avant analyse (supprime accroches marketing et bruit jobboard). */
export function cleanPastedOfferText(text: string): string {
  let cleaned = text.replace(/\r/g, "\n").replace(/\t/g, " ");
  for (const pattern of PASTED_NOISE_INLINE) {
    cleaned = cleaned.replace(pattern, "");
  }
  cleaned = cleaned.replace(/([a-zà-ÿ])([A-Z])/g, "$1 $2");

  const lines = cleaned
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0)
    .filter((line) => !PASTED_NOISE_LINE_PATTERNS.some((p) => p.test(line)));

  return lines.join("\n").trim();
}

function looksLikeCompanyLine(line: string): boolean {
  if (line.length < 2 || line.length > 50) return false;
  if (/[.!??:]/.test(line)) return false;
  if (/\b(vous|nous|cherchez|reconnaissez|alternance|apprentissage|mission|profil)\b/i.test(line)) {
    return false;
  }
  const words = line.split(/\s+/);
  if (words.length > 6) return false;
  return true;
}

function looksLikeTitleLine(line: string): boolean {
  if (line.length < 8 || line.length > 120) return false;
  if (/^(missions?|profil|description|localisation|infos)\b/i.test(line)) return false;
  if (/vous cherchez|reconnaissez dans/i.test(line)) return false;
  return /\b(alternant|alternance|apprenti|ing[eé]nieur|assistant|technicien|auditeur|commercial|stagiaire|contrat)\b/i.test(
    line,
  ) || line.length >= 12;
}

/** Lit titre / entreprise / lieu depuis la structure typique d'une annonce collée. */
export function extractMetadataFromPastedText(text: string): StructuredOfferHints {
  const cleaned = cleanPastedOfferText(text);
  const hints: StructuredOfferHints = {
    title: null,
    company: null,
    location: null,
    rawDescription: cleaned || null,
    contractHint: detectContractHint(cleaned),
    confidence: "low",
    sources: [],
  };

  const lines = cleaned.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return hints;

  if (looksLikeTitleLine(lines[0] ?? "")) {
    hints.title = lines[0] ?? null;
    hints.sources.push("pasted:line1-title");
  }

  for (let i = 1; i < Math.min(lines.length, 4); i++) {
    const line = lines[i] ?? "";
    if (hints.company) break;
    if (looksLikeCompanyLine(line)) {
      hints.company = line;
      hints.sources.push(`pasted:line${i + 1}-company`);
    }
  }

  const locMatch =
    cleaned.match(/localisation\s*:\s*([^\n]+)/i) ??
    cleaned.match(/(?:lieu|ville)\s*:\s*([^\n]+)/i) ??
    cleaned.match(/\b([A-ZÀ-Ÿ][A-Za-zÀ-ÿ'’.\- ]{2,40})\s*\((\d{2,3})\)/);
  if (locMatch) {
    hints.location = (locMatch[1] ?? "").trim();
    hints.sources.push("pasted:location");
  }

  if (hints.title && hints.company) hints.confidence = "high";
  else if (hints.title || hints.company) hints.confidence = "medium";

  return hints;
}

export function mergeStructuredHints(
  ...parts: Array<StructuredOfferHints | null | undefined>
): StructuredOfferHints {
  const merged: StructuredOfferHints = {
    title: null,
    company: null,
    location: null,
    rawDescription: null,
    contractHint: null,
    confidence: "low",
    sources: [],
  };

  const order = parts.filter(Boolean) as StructuredOfferHints[];
  const rank = { high: 3, medium: 2, low: 1 };

  for (const part of order) {
    if (!merged.title && part.title) merged.title = part.title;
    if (!merged.company && part.company) merged.company = part.company;
    if (!merged.location && part.location) merged.location = part.location;
    if (!merged.rawDescription && part.rawDescription) merged.rawDescription = part.rawDescription;
    if (!merged.contractHint && part.contractHint) merged.contractHint = part.contractHint;
    merged.sources.push(...part.sources);
    if (rank[part.confidence] > rank[merged.confidence]) {
      merged.confidence = part.confidence;
    }
  }

  return merged;
}

export function companyFromUrl(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const segment = host.split(".")[0] ?? "";
    if (segment.length < 3 || segment.length > 30) return null;
    if (/^(careers|jobs|recrutement|emploi|talents|join)$/i.test(segment)) return null;
    return segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return null;
  }
}
