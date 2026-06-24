import { env } from "@/lib/env";
import {
  buildOfferExtractUserMessage,
  finalizeExtractedOffer,
  OFFER_EXTRACT_SYSTEM_PROMPT,
  type ExtractedOfferFields,
  type OfferExtractModelOutput,
} from "@/lib/offer-extract-prompt";

export type { ExtractedOfferFields };

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

export async function fetchOfferPageText(url: string): Promise<{
  ok: boolean;
  text: string;
  fetchError?: string;
}> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ARTEMSI/1.0; +https://artemsi.fr) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      return {
        ok: false,
        text: "",
        fetchError: `Impossible de lire la page (${response.status}). Colle le texte de l'annonce ci-dessous.`,
      };
    }

    const html = await response.text();
    const ogTitle = metaContent(html, "og:title");
    const titleTag = decodeHtmlEntities(html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "");
    const prefix = ogTitle || titleTag;
    const body = stripHtml(html).slice(0, 12_000);

    return {
      ok: true,
      text: prefix ? `${prefix}\n\n${body}` : body,
    };
  } catch (cause) {
    return {
      ok: false,
      text: "",
      fetchError:
        cause instanceof Error
          ? `${cause.message}. Colle le texte de l'annonce ci-dessous.`
          : "Erreur de telechargement. Colle le texte de l'annonce ci-dessous.",
    };
  }
}

function heuristicExtract(url: string, raw: string): ExtractedOfferFields {
  const lines = raw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const titleLine =
    lines.find((line) => line.length >= 8 && line.length <= 120 && !/cookie|mentions légales/i.test(line)) ??
    lines[0] ??
    "Offre alternance";

  const contractHint = /apprentissage|apprenti/i.test(raw)
    ? "apprentissage"
    : /contrat pro|professionnalisation/i.test(raw)
      ? "pro"
      : /alternance/i.test(raw)
        ? "alternance"
        : null;

  const companyMatch = raw.match(
    /(?:chez|entreprise|société|societe|employeur)\s*[:\-]?\s*([^\n.]{2,80})/i,
  );

  const base: Partial<OfferExtractModelOutput> = {
    title: titleLine,
    company: companyMatch?.[1]?.trim() ?? null,
    location: null,
    description: raw.slice(0, 4000).trim() || `Offre importée depuis ${url}`,
    contractHint,
    jobKeywords: titleLine
      .split(/\s+/)
      .map((t) => t.replace(/[^A-Za-zÀ-ÿ0-9+]/g, ""))
      .filter((t) => t.length >= 4)
      .slice(0, 6),
    locationKeywords: [],
  };

  return (
    finalizeExtractedOffer(base, raw) ?? {
      title: titleLine,
      company: base.company ?? null,
      location: base.location ?? null,
      description: base.description ?? "",
      contractHint,
    }
  );
}

async function extractWithOpenAI(
  url: string,
  raw: string,
): Promise<{ fields: ExtractedOfferFields | null; error: string | null }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return { fields: null, error: "OPENAI_API_KEY non configuree" };

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      max_tokens: 2200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: OFFER_EXTRACT_SYSTEM_PROMPT },
        { role: "user", content: buildOfferExtractUserMessage(url, raw) },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return {
      fields: null,
      error: `OpenAI a refuse l'analyse (${response.status})${body ? ` : ${body.slice(0, 180)}` : ""}`,
    };
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return { fields: null, error: "OpenAI n'a retourne aucun contenu" };

  try {
    const parsed = JSON.parse(content) as Partial<OfferExtractModelOutput>;
    return { fields: finalizeExtractedOffer(parsed, raw), error: null };
  } catch {
    return { fields: null, error: "OpenAI a retourne un JSON illisible" };
  }
}

export async function extractOfferFieldsFromUrl(input: {
  url: string;
  pastedText?: string;
}): Promise<{
  fields: ExtractedOfferFields;
  fetchWarning: string | null;
  usedAi: boolean;
  rawSource: string;
}> {
  const url = input.url.trim();
  const pasted = input.pastedText?.trim() ?? "";

  let raw = "";
  let rawSource = "";
  let fetchWarning: string | null = null;

  const fetched = await fetchOfferPageText(url);
  if (!fetched.ok) fetchWarning = fetched.fetchError ?? null;

  if (pasted && fetched.ok && fetched.text) {
    raw = `TEXTE COLLE PAR L'ADMIN (source prioritaire):\n${pasted}\n\nTEXTE RECUPERE DE LA PAGE OFFICIELLE (complement):\n${fetched.text}`;
    rawSource = "texte colle + page officielle";
  } else if (pasted) {
    raw = pasted;
    rawSource = "texte colle";
  } else {
    raw = fetched.text;
    rawSource = fetched.ok ? "page officielle" : "aucune source lisible";
  }

  if (!raw) {
    return {
      fields: {
        title: "Offre a completer",
        company: null,
        location: null,
        description: `URL: ${url}\n\nColle la description de l'offre.`,
        contractHint: null,
      },
      fetchWarning,
      usedAi: false,
      rawSource,
    };
  }

  const ai = await extractWithOpenAI(url, raw);
  if (ai.fields) {
    return { fields: ai.fields, fetchWarning, usedAi: true, rawSource };
  }

  return {
    fields: heuristicExtract(url, raw),
    fetchWarning: fetchWarning
      ? `${fetchWarning} Analyse IA non appliquee (${ai.error ?? "raison inconnue"}). Extraction basique utilisee.`
      : env.OPENAI_API_KEY
        ? `Analyse IA non appliquee (${ai.error ?? "raison inconnue"}). Extraction basique utilisee.`
        : "OPENAI_API_KEY non configure : extraction basique. Ajoute la cle pour une meilleure analyse.",
    usedAi: false,
    rawSource,
  };
}
