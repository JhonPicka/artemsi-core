import { z } from "zod";

const MAX_TIPS = 6;
const itemSchema = z.string().min(2).max(160);

const guideSchema = z.object({
  tips: z.array(itemSchema).max(MAX_TIPS),
});

export type OfferApplicationGuide = z.infer<typeof guideSchema>;

function cleanTips(values: unknown, max = MAX_TIPS): string[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const trimmed = String(value ?? "").trim().replace(/\s+/g, " ");
    if (trimmed.length < 2 || trimmed.length > 160) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
    if (out.length >= max) break;
  }
  return out;
}

export function normalizeApplicationGuide(input: unknown): OfferApplicationGuide | null {
  if (!input || typeof input !== "object") return null;

  const tips = cleanTips((input as Record<string, unknown>).tips);
  if (tips.length === 0) return null;

  const parsed = guideSchema.safeParse({ tips });
  return parsed.success ? parsed.data : null;
}

export function guideTipsToText(guide: OfferApplicationGuide | null | undefined): string {
  return guide?.tips.join("\n") ?? "";
}

export function textToApplicationGuide(text: string): OfferApplicationGuide | null {
  const tips = cleanTips(
    text
      .split(/\n+/)
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean),
  );
  return normalizeApplicationGuide({ tips });
}

export function buildGuideCopyText(guide: OfferApplicationGuide): string {
  if (guide.tips.length === 0) return "";
  return ["Raccourci ARTEMSI pour ce poste", "", ...guide.tips.map((tip) => `• ${tip}`)].join("\n");
}
