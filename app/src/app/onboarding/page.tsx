import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { isAdminUser } from "@/lib/admin-auth";
import { resolveAdminPostAuthPath } from "@/lib/admin-profile";
import { needsPasswordSetup } from "@/lib/auth-session";
import { requireActiveSubscription } from "@/lib/billing";
import { requireUser } from "@/lib/auth";
import {
  ACQUISITION_SOURCES,
  ALTERNANCE_RHYTHMS,
  APPLICATIONS_SENT_RANGES,
  CONTRACT_DURATIONS,
  CONTRACT_TYPES,
  PREFERRED_SECTORS,
  SEARCH_LEVELS,
  STUDY_DOMAINS,
  STUDY_LEVEL_OPTIONS,
  type AcquisitionSource,
  type AlternanceRhythm,
  type ApplicationsSentRange,
  type PreferredSector,
  type SearchLevel,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

function pickEnum<T extends string>(value: string | null | undefined, allowed: readonly T[], fallback: T) {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export default async function OnboardingPage() {
  const user = await requireUser();
  if (isAdminUser(user)) {
    redirect(await resolveAdminPostAuthPath(user));
  }
  if (needsPasswordSetup(user)) {
    redirect("/signup/finish");
  }
  await requireActiveSubscription(user);
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, phone, school_name, study_level, study_domain, target_job, regions, start_date, contract_type, contract_duration, alternance_rhythm, alternance_rhythm_other, preferred_sectors, acquisition_source, acquisition_source_other, applications_sent_range, search_level, onboarding_completed",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  const studyLevel = pickEnum(profile?.study_level, STUDY_LEVEL_OPTIONS, STUDY_LEVEL_OPTIONS[0]);
  const studyDomain = pickEnum(profile?.study_domain, STUDY_DOMAINS, STUDY_DOMAINS[0]);
  const contractType = pickEnum(profile?.contract_type, CONTRACT_TYPES, CONTRACT_TYPES[0]);
  const contractDuration = pickEnum(profile?.contract_duration, CONTRACT_DURATIONS, "12_MONTHS");
  const alternanceRhythm: AlternanceRhythm | "" = ALTERNANCE_RHYTHMS.includes(
    profile?.alternance_rhythm as AlternanceRhythm,
  )
    ? (profile?.alternance_rhythm as AlternanceRhythm)
    : contractType === "ALTERNANCE" || contractType === "APPRENTISSAGE"
      ? ""
      : "NOT_APPLICABLE";
  const preferredSectors = ((profile?.preferred_sectors as string[] | null) ?? []).filter(
    (sector): sector is PreferredSector =>
      PREFERRED_SECTORS.includes(sector as PreferredSector),
  );

  return (
    <main className="centered-page">
      <OnboardingForm
        initialValues={{
          fullName: profile?.full_name ?? "",
          phone: profile?.phone ?? "",
          schoolName: profile?.school_name ?? "",
          studyLevel,
          studyDomain,
          targetJob: profile?.target_job ?? "",
          regions: (profile?.regions as string[]) ?? [],
          startDate: profile?.start_date ?? "",
          contractType,
          contractDuration,
          alternanceRhythm,
          alternanceRhythmOther: profile?.alternance_rhythm_other ?? "",
          preferredSectors,
          acquisitionSource: pickEnum(
            profile?.acquisition_source,
            ACQUISITION_SOURCES,
            "" as AcquisitionSource,
          ),
          acquisitionSourceOther: profile?.acquisition_source_other ?? "",
          applicationsSentRange: pickEnum(
            profile?.applications_sent_range,
            APPLICATIONS_SENT_RANGES,
            "" as ApplicationsSentRange,
          ),
          searchLevel: pickEnum(profile?.search_level, SEARCH_LEVELS, "" as SearchLevel),
        }}
      />
    </main>
  );
}
