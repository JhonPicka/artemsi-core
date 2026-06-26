import { z } from "zod";

import { STUDY_DOMAINS } from "@/lib/constants";

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export const adminOfferBodySchema = z
  .object({
    title: z.string().min(2).max(200),
    company: z.string().max(200).optional().nullable(),
    location: z.string().max(200).optional().nullable(),
    url: z.string().optional().nullable(),
    description: z.string().min(20).max(8000),
    studyDomain: z.enum(STUDY_DOMAINS),
    source: z.enum(["partner", "autre"]),
    isPublic: z.boolean(),
    isPartnerExclusive: z.boolean(),
    applicationGuide: z.record(z.string(), z.unknown()).optional().nullable(),
    runMatching: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    const url = data.url?.trim() ?? "";

    if (data.isPartnerExclusive) {
      if (url && !isValidHttpUrl(url)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL invalide.",
          path: ["url"],
        });
      }
      return;
    }

    if (!url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL requise pour une offre non exclusive.",
        path: ["url"],
      });
      return;
    }

    if (!isValidHttpUrl(url)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL invalide.",
        path: ["url"],
      });
    }
  });

export type AdminOfferBody = z.infer<typeof adminOfferBodySchema>;

export function normalizeAdminOfferUrl(url: string | null | undefined, isPartnerExclusive: boolean) {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) {
    return isPartnerExclusive ? null : "";
  }
  return trimmed;
}
