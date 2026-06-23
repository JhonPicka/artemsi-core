import { z } from "zod";

import { MAX_DOCUMENT_SIZE_BYTES, SUPPORTED_DOCUMENT_MIME_TYPES } from "@/lib/constants";
import { isValidYyyyMmDdDate, normalizeToYyyyMmDd } from "@/lib/dates-fr";

export {
  onboardingSchema,
  type OnboardingInput,
  type OnboardingFormValues,
  validateOnboardingStep,
  normalizeOnboardingPayload,
} from "@/lib/onboarding-validation";

function calendarDateYyyyMmDdSchema(message: string) {
  return z
    .string()
    .transform((s) => normalizeToYyyyMmDd(s))
    .refine((s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && isValidYyyyMmDdDate(s), { message });
}

const passwordFieldSchema = z
  .string()
  .min(8, "Le mot de passe doit faire au moins 8 caractères")
  .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule")
  .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre");

const legalConsentSchema = z
  .string()
  .optional()
  .refine((v) => v === "on", {
    message: "Tu dois accepter les CGU et la politique de confidentialité.",
  });

export const signupSchema = z
  .object({
    email: z.email("Email invalide"),
    password: passwordFieldSchema,
    confirmPassword: z.string(),
    acceptLegal: legalConsentSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const activatePaidAccountSchema = z.object({
  email: z.email("Email invalide"),
});

export const setPasswordSchema = z
  .object({
    password: passwordFieldSchema,
    confirmPassword: z.string(),
    acceptLegal: legalConsentSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const documentUploadSchema = z.object({
  documentType: z.enum(["cv", "cover_letter"]),
  fileName: z.string().min(1),
  fileType: z.enum(SUPPORTED_DOCUMENT_MIME_TYPES),
  fileSize: z
    .number()
    .positive()
    .max(
      MAX_DOCUMENT_SIZE_BYTES,
      `Le fichier ne doit pas dépasser ${MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024)}MB`,
    ),
});

export const APPLICATION_STATUSES = [
  "sent",
  "interview",
  "accepted",
  "rejected",
  "archived",
] as const;

export const applicationCreateSchema = z.object({
  title: z.string().min(2, "Titre requis"),
  company: z.string().optional(),
  location: z.string().optional(),
  url: z.string().url("URL invalide").optional().or(z.literal("")),
  status: z.enum(APPLICATION_STATUSES).default("sent"),
  appliedAt: calendarDateYyyyMmDdSchema("Date de candidature invalide"),
  notes: z.string().optional(),
  offerId: z.uuid("Identifiant offre invalide").optional().nullable(),
  cvStoragePath: z.string().min(3).max(400).optional().nullable(),
  cvFileName: z.string().min(1).max(200).optional().nullable(),
  coverLetterStoragePath: z.string().min(3).max(400).optional().nullable(),
  coverLetterFileName: z.string().min(1).max(200).optional().nullable(),
});

export const applicationUpdateSchema = z.object({
  id: z.uuid("ID invalide"),
  status: z.enum(APPLICATION_STATUSES),
});

export const offerLinkReportSchema = z.object({
  offerId: z.uuid("ID offre invalide"),
  notes: z.string().max(500).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type OfferLinkReportInput = z.infer<typeof offerLinkReportSchema>;
