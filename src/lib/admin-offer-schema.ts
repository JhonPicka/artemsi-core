import { z } from "zod";

export const adminOfferBodySchema = z.object({
  title: z.string().min(2).max(200),
  company: z.string().max(200).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  url: z.string().url(),
  description: z.string().min(20).max(8000),
  source: z.enum(["partner", "autre"]),
  isPublic: z.boolean(),
  isPartnerExclusive: z.boolean(),
  applicationGuide: z.record(z.string(), z.unknown()).optional().nullable(),
  runMatching: z.boolean().optional().default(false),
});

export type AdminOfferBody = z.infer<typeof adminOfferBodySchema>;
