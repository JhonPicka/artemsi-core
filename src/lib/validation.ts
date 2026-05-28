import { z } from "zod";

import {
  CONTRACT_DURATIONS,
  CONTRACT_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  REGIONS,
  STUDY_DOMAINS,
  STUDY_LEVELS,
  SUPPORTED_DOCUMENT_MIME_TYPES,
} from "@/lib/constants";
import { isValidYyyyMmDdDate, normalizeToYyyyMmDd } from "@/lib/dates-fr";

function calendarDateYyyyMmDdSchema(message: string) {
  return z
    .string()
    .transform((s) => normalizeToYyyyMmDd(s))
    .refine((s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && isValidYyyyMmDdDate(s), { message });
}

export const authEmailSchema = z.object({
  email: z.email("Email invalide"),
});

export const onboardingSchema = z.object({
  fullName: z.string().min(2, "Nom complet requis"),
  phone: z.string().min(8, "Téléphone invalide"),
  schoolName: z.string().min(2, "Nom de l'école requis"),
  studyLevel: z.enum(STUDY_LEVELS),
  studyDomain: z.enum(STUDY_DOMAINS),
  targetJob: z.string().min(2, "Poste recherché requis"),
  regions: z.array(z.enum(REGIONS)).min(1, "Sélectionne au moins une région"),
  startDate: calendarDateYyyyMmDdSchema("Date invalide"),
  contractType: z.enum(CONTRACT_TYPES),
  contractDuration: z.enum(CONTRACT_DURATIONS),
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

export type AuthEmailInput = z.infer<typeof authEmailSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
