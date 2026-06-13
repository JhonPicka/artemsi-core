import { z } from "zod";

const itemSchema = z.string().min(2).max(200);

const guideSchema = z.object({
  cvEssentials: z.object({
    competencies: z.array(itemSchema).max(10),
    education: z.array(itemSchema).max(8),
    profile: z.array(itemSchema).max(8),
    keyFacts: z.array(itemSchema).max(10),
  }),
  letterAngles: z.array(itemSchema).max(6),
  typicalQuestions: z.array(itemSchema).max(8),
  questionsToAsk: z.array(itemSchema).max(8),
});

export type OfferApplicationGuide = z.infer<typeof guideSchema>;

export const EMPTY_APPLICATION_GUIDE: OfferApplicationGuide = {
  cvEssentials: {
    competencies: [],
    education: [],
    profile: [],
    keyFacts: [],
  },
  letterAngles: [],
  typicalQuestions: [],
  questionsToAsk: [],
};

function cleanItems(values: unknown, max = 10): string[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const trimmed = String(value ?? "").trim().replace(/\s+/g, " ");
    if (trimmed.length < 2 || trimmed.length > 200) continue;
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

  const raw = input as Record<string, unknown>;
  const cv = (raw.cvEssentials as Record<string, unknown>) ?? {};

  const guide: OfferApplicationGuide = {
    cvEssentials: {
      competencies: cleanItems(cv.competencies, 10),
      education: cleanItems(cv.education, 8),
      profile: cleanItems(cv.profile, 8),
      keyFacts: cleanItems(cv.keyFacts, 10),
    },
    letterAngles: cleanItems(raw.letterAngles, 6),
    typicalQuestions: cleanItems(raw.typicalQuestions, 8),
    questionsToAsk: cleanItems(raw.questionsToAsk, 8),
  };

  const hasContent =
    guide.cvEssentials.competencies.length > 0 ||
    guide.cvEssentials.education.length > 0 ||
    guide.cvEssentials.profile.length > 0 ||
    guide.cvEssentials.keyFacts.length > 0 ||
    guide.letterAngles.length > 0 ||
    guide.typicalQuestions.length > 0 ||
    guide.questionsToAsk.length > 0;

  if (!hasContent) return null;

  const parsed = guideSchema.safeParse(guide);
  return parsed.success ? parsed.data : null;
}

/** Mots-clés plats pour matching rapide + copie (rétrocompat keywords). */
export function keywordsFromApplicationGuide(guide: OfferApplicationGuide | null): string[] {
  if (!guide) return [];
  return cleanItems(
    [
      ...guide.cvEssentials.competencies,
      ...guide.cvEssentials.education.slice(0, 3),
      ...guide.cvEssentials.profile.slice(0, 3),
    ],
    20,
  );
}

export function applicationGuideHasContent(guide: OfferApplicationGuide | null | undefined) {
  if (!guide) return false;
  return (
    guide.cvEssentials.competencies.length > 0 ||
    guide.cvEssentials.education.length > 0 ||
    guide.cvEssentials.profile.length > 0 ||
    guide.cvEssentials.keyFacts.length > 0 ||
    guide.letterAngles.length > 0 ||
    guide.typicalQuestions.length > 0 ||
    guide.questionsToAsk.length > 0
  );
}

export function guideSectionToText(items: string[]) {
  return items.join("\n");
}

export function textToGuideSection(text: string, max = 10) {
  return cleanItems(
    text
      .split(/\n+/)
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean),
    max,
  );
}

export type ApplicationGuideFormState = {
  competencies: string;
  education: string;
  profile: string;
  keyFacts: string;
  letterAngles: string;
  typicalQuestions: string;
  questionsToAsk: string;
};

export function guideToFormState(guide: OfferApplicationGuide | null): ApplicationGuideFormState {
  const g = guide ?? EMPTY_APPLICATION_GUIDE;
  return {
    competencies: guideSectionToText(g.cvEssentials.competencies),
    education: guideSectionToText(g.cvEssentials.education),
    profile: guideSectionToText(g.cvEssentials.profile),
    keyFacts: guideSectionToText(g.cvEssentials.keyFacts),
    letterAngles: guideSectionToText(g.letterAngles),
    typicalQuestions: guideSectionToText(g.typicalQuestions),
    questionsToAsk: guideSectionToText(g.questionsToAsk),
  };
}

export function formStateToApplicationGuide(form: ApplicationGuideFormState): OfferApplicationGuide | null {
  return normalizeApplicationGuide({
    cvEssentials: {
      competencies: textToGuideSection(form.competencies, 10),
      education: textToGuideSection(form.education, 8),
      profile: textToGuideSection(form.profile, 8),
      keyFacts: textToGuideSection(form.keyFacts, 10),
    },
    letterAngles: textToGuideSection(form.letterAngles, 6),
    typicalQuestions: textToGuideSection(form.typicalQuestions, 8),
    questionsToAsk: textToGuideSection(form.questionsToAsk, 8),
  });
}

export function buildGuideCopyText(guide: OfferApplicationGuide) {
  const sections: string[] = ["Guide ARTEMSI — CV & lettre de motivation", ""];

  const pushSection = (title: string, items: string[]) => {
    if (items.length === 0) return;
    sections.push(title, ...items.map((item) => `• ${item}`), "");
  };

  pushSection("Compétences à mettre en avant (CV)", guide.cvEssentials.competencies);
  pushSection("Cursus & formation (CV)", guide.cvEssentials.education);
  pushSection("Profil recherché (CV)", guide.cvEssentials.profile);
  pushSection("Infos clés (dates, rythme, contrat…)", guide.cvEssentials.keyFacts);
  pushSection("Angles pour la lettre de motivation", guide.letterAngles);
  pushSection("Questions typiques en entretien", guide.typicalQuestions);
  pushSection("Questions à poser au recruteur", guide.questionsToAsk);

  return sections.join("\n").trim();
}
