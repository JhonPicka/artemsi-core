import { z } from "zod";

import {
  ACQUISITION_SOURCES,
  ALTERNANCE_RHYTHMS,
  APPLICATIONS_SENT_RANGES,
  CONTRACT_DURATIONS,
  CONTRACT_TYPES,
  PREFERRED_SECTORS,
  REGIONS,
  SEARCH_LEVELS,
  STUDY_DOMAINS,
  STUDY_LEVELS,
  type ContractType,
} from "@/lib/constants";
import { isValidYyyyMmDdDate, normalizeToYyyyMmDd } from "@/lib/dates-fr";

function calendarDateYyyyMmDdSchema(message: string) {
  return z
    .string()
    .transform((s) => normalizeToYyyyMmDd(s))
    .refine((s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && isValidYyyyMmDdDate(s), { message });
}

function requiresAlternanceRhythm(contractType: ContractType) {
  return contractType === "ALTERNANCE" || contractType === "APPRENTISSAGE";
}

export const onboardingStep1Schema = z.object({
  fullName: z.string().min(2, "Nom complet requis"),
  phone: z.string().min(8, "Téléphone invalide"),
  schoolName: z.string().min(2, "Nom de l'école requis"),
  studyLevel: z.enum(STUDY_LEVELS),
  studyDomain: z.enum(STUDY_DOMAINS),
});

export const onboardingStep2Schema = z.object({
  targetJob: z.string().min(2, "Poste recherché requis"),
  startDate: calendarDateYyyyMmDdSchema("Date invalide"),
  contractType: z.enum(CONTRACT_TYPES),
  contractDuration: z.enum(CONTRACT_DURATIONS),
  regions: z.array(z.enum(REGIONS)).min(1, "Sélectionne au moins une région"),
});

export const onboardingStep3Schema = z.object({
  contractType: z.enum(CONTRACT_TYPES),
  alternanceRhythm: z.enum(ALTERNANCE_RHYTHMS).optional(),
  alternanceRhythmOther: z.string().optional(),
  preferredSectors: z
    .array(z.enum(PREFERRED_SECTORS))
    .min(1, "Sélectionne au moins un secteur"),
});

export const onboardingStep4Schema = z.object({
  acquisitionSource: z.enum(ACQUISITION_SOURCES, {
    message: "Indique comment tu as connu ARTEMSI",
  }),
  acquisitionSourceOther: z.string().optional(),
  applicationsSentRange: z.enum(APPLICATIONS_SENT_RANGES, {
    message: "Indique combien de candidatures tu as déjà envoyées",
  }),
  searchLevel: z.enum(SEARCH_LEVELS, {
    message: "Indique où tu en es dans ta recherche",
  }),
});

export const onboardingBusinessFieldsSchema = onboardingStep4Schema.superRefine((data, ctx) => {
  if (data.acquisitionSource === "AUTRE" && !data.acquisitionSourceOther?.trim()) {
    ctx.addIssue({
      code: "custom",
      message: "Précise comment tu as connu ARTEMSI",
      path: ["acquisitionSourceOther"],
    });
  }
});

export const onboardingSchema = onboardingStep1Schema
  .merge(onboardingStep2Schema)
  .merge(
    z.object({
      alternanceRhythm: z.enum(ALTERNANCE_RHYTHMS).optional(),
      alternanceRhythmOther: z.string().optional(),
      preferredSectors: z
        .array(z.enum(PREFERRED_SECTORS))
        .min(1, "Sélectionne au moins un secteur"),
      acquisitionSource: z.enum(ACQUISITION_SOURCES),
      acquisitionSourceOther: z.string().optional(),
      applicationsSentRange: z.enum(APPLICATIONS_SENT_RANGES),
      searchLevel: z.enum(SEARCH_LEVELS),
    }),
  )
  .superRefine((data, ctx) => {
    if (requiresAlternanceRhythm(data.contractType)) {
      if (!data.alternanceRhythm || data.alternanceRhythm === "NOT_APPLICABLE") {
        ctx.addIssue({
          code: "custom",
          message: "Rythme d'alternance requis",
          path: ["alternanceRhythm"],
        });
      } else if (data.alternanceRhythm === "AUTRE" && !data.alternanceRhythmOther?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Précise ton rythme d'alternance",
          path: ["alternanceRhythmOther"],
        });
      }
    }

    if (data.acquisitionSource === "AUTRE" && !data.acquisitionSourceOther?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Précise comment tu as connu ARTEMSI",
        path: ["acquisitionSourceOther"],
      });
    }
  });

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export type OnboardingFormValues = {
  fullName: string;
  phone: string;
  schoolName: string;
  studyLevel: OnboardingInput["studyLevel"];
  studyDomain: OnboardingInput["studyDomain"];
  targetJob: string;
  regions: string[];
  startDate: string;
  contractType: OnboardingInput["contractType"];
  contractDuration: OnboardingInput["contractDuration"];
  alternanceRhythm: OnboardingInput["alternanceRhythm"] | "";
  alternanceRhythmOther: string;
  preferredSectors: OnboardingInput["preferredSectors"];
  acquisitionSource: OnboardingInput["acquisitionSource"] | "";
  acquisitionSourceOther: string;
  applicationsSentRange: OnboardingInput["applicationsSentRange"] | "";
  searchLevel: OnboardingInput["searchLevel"] | "";
};

export function validateOnboardingStep(
  step: number,
  values: OnboardingFormValues,
): string | null {
  if (step === 1) {
    const parsed = onboardingStep1Schema.safeParse(values);
    return parsed.success ? null : (parsed.error.issues[0]?.message ?? "Étape invalide");
  }

  if (step === 2) {
    const parsed = onboardingStep2Schema.safeParse(values);
    return parsed.success ? null : (parsed.error.issues[0]?.message ?? "Étape invalide");
  }

  if (step === 3) {
    const rhythm =
      values.alternanceRhythm && values.alternanceRhythm.length > 0
        ? values.alternanceRhythm
        : requiresAlternanceRhythm(values.contractType)
          ? undefined
          : "NOT_APPLICABLE";

    const parsed = onboardingStep3Schema.safeParse({
      contractType: values.contractType,
      alternanceRhythm: rhythm,
      alternanceRhythmOther: values.alternanceRhythmOther,
      preferredSectors: values.preferredSectors,
    });

    if (!parsed.success) {
      return parsed.error.issues[0]?.message ?? "Étape invalide";
    }

    if (requiresAlternanceRhythm(values.contractType)) {
      if (!values.alternanceRhythm || values.alternanceRhythm === "NOT_APPLICABLE") {
        return "Rythme d'alternance requis";
      }
      if (values.alternanceRhythm === "AUTRE" && !values.alternanceRhythmOther.trim()) {
        return "Précise ton rythme d'alternance";
      }
    }

    return null;
  }

  if (step === 4) {
    const parsed = onboardingBusinessFieldsSchema.safeParse({
      acquisitionSource: values.acquisitionSource || undefined,
      acquisitionSourceOther: values.acquisitionSourceOther,
      applicationsSentRange: values.applicationsSentRange || undefined,
      searchLevel: values.searchLevel || undefined,
    });
    return parsed.success ? null : (parsed.error.issues[0]?.message ?? "Étape invalide");
  }

  return null;
}

export function normalizeOnboardingPayload(values: OnboardingFormValues): OnboardingInput | null {
  const rhythm = requiresAlternanceRhythm(values.contractType)
    ? values.alternanceRhythm || undefined
    : "NOT_APPLICABLE";

  const parsed = onboardingSchema.safeParse({
    ...values,
    alternanceRhythm: rhythm,
  });

  return parsed.success ? parsed.data : null;
}
