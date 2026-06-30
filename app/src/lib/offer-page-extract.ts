import { env } from "@/lib/env";
import {
  buildOfferDescriptionExtractUserMessage,
  buildOfferExtractUserMessage,
  finalizeExtractedOffer,
  OFFER_DESCRIPTION_EXTRACT_PROMPT,
  OFFER_EXTRACT_SYSTEM_PROMPT,
  primaryOfferSourceText,
  type ExtractedOfferFields,
  type OfferExtractModelOutput,
  type OfferExtractSource,
} from "@/lib/offer-extract-prompt";
import { mergeAiWithStructuredHints } from "@/lib/offer-extract-merge";
import {
  cleanPastedOfferText,
  companyFromUrl,
  extractMetadataFromPastedText,
  extractStructuredOfferFromHtml,
  mergeStructuredHints,
  type StructuredOfferHints,
} from "@/lib/offer-structured-extract";

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

type FetchedPage = {
  ok: boolean;
  html: string;
  text: string;
  structured: StructuredOfferHints;
  fetchError?: string;
};

async function fetchOfferPage(url: string): Promise<FetchedPage> {
  const empty: FetchedPage = {
    ok: false,
    html: "",
    text: "",
    structured: {
      title: null,
      company: null,
      location: null,
      rawDescription: null,
      contractHint: null,
      confidence: "low",
      sources: [],
    },
  };

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
        ...empty,
        fetchError: `Impossible de lire la page (${response.status}). Colle le texte de l'annonce ci-dessous.`,
      };
    }

    const html = await response.text();
    const ogTitle = metaContent(html, "og:title");
    const titleTag = decodeHtmlEntities(html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "");
    const prefix = ogTitle || titleTag;
    const body = stripHtml(html).slice(0, 12_000);
    const structured = extractStructuredOfferFromHtml(html);

    return {
      ok: true,
      html,
      text: prefix ? `${prefix}\n\n${body}` : body,
      structured,
    };
  } catch (cause) {
    return {
      ...empty,
      fetchError:
        cause instanceof Error
          ? `${cause.message}. Colle le texte de l'annonce ci-dessous.`
          : "Erreur de telechargement. Colle le texte de l'annonce ci-dessous.",
    };
  }
}

function hintsToSourceHints(
  hints: StructuredOfferHints,
): NonNullable<OfferExtractSource["structuredHints"]> {
  return {
    title: hints.title,
    company: hints.company,
    location: hints.location,
    contractHint: hints.contractHint,
    sources: hints.sources,
  };
}

function hasReliableMetadata(hints: StructuredOfferHints) {
  return Boolean(hints.title && hints.company && hints.confidence !== "low");
}

async function callOpenAI(
  systemPrompt: string,
  userMessage: string,
): Promise<{ parsed: Partial<OfferExtractModelOutput> | null; error: string | null }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return { parsed: null, error: "OPENAI_API_KEY non configuree" };

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
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return {
      parsed: null,
      error: `OpenAI a refuse l'analyse (${response.status})${body ? ` : ${body.slice(0, 180)}` : ""}`,
    };
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return { parsed: null, error: "OpenAI n'a retourne aucun contenu" };

  try {
    return { parsed: JSON.parse(content) as Partial<OfferExtractModelOutput>, error: null };
  } catch {
    return { parsed: null, error: "OpenAI a retourne un JSON illisible" };
  }
}

function heuristicExtract(
  url: string,
  raw: string,
  hints: StructuredOfferHints,
): ExtractedOfferFields {
  const base: Partial<OfferExtractModelOutput> = {
    title: hints.title ?? "Offre alternance",
    company: hints.company ?? companyFromUrl(url),
    location: hints.location,
    description:
      hints.rawDescription ?? (raw.slice(0, 4000).trim() || `Offre importée depuis ${url}`),
    contractHint: hints.contractHint,
  };

  return (
    mergeAiWithStructuredHints(base, hints, raw, url) ??
    finalizeExtractedOffer(base, raw, url) ?? {
      title: base.title ?? "Offre alternance",
      company: base.company ?? null,
      location: base.location ?? null,
      description: base.description ?? "",
      contractHint: hints.contractHint,
      studyDomain: null,
    }
  );
}

async function extractWithPipeline(
  url: string,
  source: OfferExtractSource,
  hints: StructuredOfferHints,
): Promise<{ fields: ExtractedOfferFields | null; error: string | null; mode: string }> {
  const raw = primaryOfferSourceText(source);
  const cleanedPasted = source.pastedText ? cleanPastedOfferText(source.pastedText) : "";

  if (hasReliableMetadata(hints) && cleanedPasted.length >= 80) {
    const descAi = await callOpenAI(
      OFFER_DESCRIPTION_EXTRACT_PROMPT,
      buildOfferDescriptionExtractUserMessage(url, cleanedPasted, hintsToSourceHints(hints)),
    );
    if (descAi.parsed?.description) {
      const fields = mergeAiWithStructuredHints(
        {
          title: hints.title!,
          company: hints.company,
          location: hints.location,
          description: descAi.parsed.description,
          contractHint: descAi.parsed.contractHint ?? hints.contractHint,
          studyDomainHint: descAi.parsed.studyDomainHint,
          locationKeywords: descAi.parsed.locationKeywords,
          jobKeywords: descAi.parsed.jobKeywords,
        },
        hints,
        raw,
        url,
      );
      if (fields) return { fields, error: null, mode: "metadata-deterministe + ia-description" };
    }
  }

  const fullSource: OfferExtractSource = {
    ...source,
    pastedText: cleanedPasted || source.pastedText,
    structuredHints: hintsToSourceHints(hints),
  };

  const fullAi = await callOpenAI(
    OFFER_EXTRACT_SYSTEM_PROMPT,
    buildOfferExtractUserMessage(url, fullSource),
  );

  if (fullAi.parsed) {
    const fields = mergeAiWithStructuredHints(fullAi.parsed, hints, raw, url);
    if (fields) return { fields, error: null, mode: "ia-complete + fusion" };
  }

  return { fields: null, error: fullAi.error, mode: "echec" };
}

export async function extractOfferFieldsFromUrl(input: {
  url: string;
  pastedText?: string;
}): Promise<{
  fields: ExtractedOfferFields;
  fetchWarning: string | null;
  usedAi: boolean;
  rawSource: string;
  extractMode?: string;
}> {
  const url = input.url.trim();
  const pasted = input.pastedText?.trim() ?? "";

  let rawSource = "";
  let fetchWarning: string | null = null;

  const fetched = await fetchOfferPage(url);
  if (!fetched.ok) fetchWarning = fetched.fetchError ?? null;

  const pastedHints = pasted ? extractMetadataFromPastedText(pasted) : null;
  const urlHints: StructuredOfferHints = {
    title: null,
    company: companyFromUrl(url),
    location: null,
    rawDescription: null,
    contractHint: null,
    confidence: "low",
    sources: companyFromUrl(url) ? ["url:hostname"] : [],
  };

  const hints = mergeStructuredHints(pastedHints, fetched.structured, urlHints);

  const cleanedPasted = pasted ? cleanPastedOfferText(pasted) : "";
  const source: OfferExtractSource = {};
  if (cleanedPasted) source.pastedText = cleanedPasted;
  if (fetched.ok && fetched.text) source.pageText = fetched.text;

  if (pasted && fetched.ok) rawSource = "texte colle + page (pipeline v2)";
  else if (pasted) rawSource = "texte colle (pipeline v2)";
  else if (fetched.ok) rawSource = "page officielle (pipeline v2)";
  else rawSource = "aucune source lisible";

  const primaryText = primaryOfferSourceText(source);
  if (!primaryText) {
    return {
      fields: {
        title: "Offre a completer",
        company: null,
        location: null,
        description: `URL: ${url}\n\nColle la description de l'offre.`,
        contractHint: null,
        studyDomain: null,
      },
      fetchWarning,
      usedAi: false,
      rawSource,
    };
  }

  const pipeline = await extractWithPipeline(url, source, hints);
  if (pipeline.fields) {
    return {
      fields: pipeline.fields,
      fetchWarning,
      usedAi: true,
      rawSource: `${rawSource} — ${pipeline.mode}`,
      extractMode: pipeline.mode,
    };
  }

  return {
    fields: heuristicExtract(url, primaryText, hints),
    fetchWarning: fetchWarning
      ? `${fetchWarning} Analyse IA non appliquee (${pipeline.error ?? "raison inconnue"}). Extraction deterministe utilisee.`
      : env.OPENAI_API_KEY
        ? `Analyse IA non appliquee (${pipeline.error ?? "raison inconnue"}). Extraction deterministe utilisee.`
        : "OPENAI_API_KEY non configure : extraction deterministe. Ajoute la cle pour l'IA.",
    usedAi: false,
    rawSource: `${rawSource} — heuristique`,
    extractMode: "heuristique",
  };
}
