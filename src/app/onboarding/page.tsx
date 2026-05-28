import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { getAdminHomePath, isAdminUser } from "@/lib/admin-auth";
import { requireActiveSubscription } from "@/lib/billing";
import { requireUser } from "@/lib/auth";
import {
  CONTRACT_DURATIONS,
  CONTRACT_TYPES,
  STUDY_DOMAINS,
  STUDY_LEVEL_OPTIONS,
  type ContractDuration,
  type ContractType,
  type StudyDomain,
  type StudyLevel,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const user = await requireUser();
  if (isAdminUser(user)) {
    redirect(getAdminHomePath());
  }
  await requireActiveSubscription(user);
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, phone, school_name, study_level, study_domain, target_job, regions, start_date, contract_type, contract_duration, onboarding_completed",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  const studyLevel: StudyLevel = STUDY_LEVEL_OPTIONS.includes(
    (profile?.study_level ?? "") as StudyLevel,
  )
    ? (profile?.study_level as StudyLevel)
    : STUDY_LEVEL_OPTIONS[0];

  const studyDomain: StudyDomain = STUDY_DOMAINS.includes(
    (profile?.study_domain ?? "") as StudyDomain,
  )
    ? (profile?.study_domain as StudyDomain)
    : STUDY_DOMAINS[0];

  const contractType: ContractType = CONTRACT_TYPES.includes(
    (profile?.contract_type ?? "") as ContractType,
  )
    ? (profile?.contract_type as ContractType)
    : CONTRACT_TYPES[0];

  const contractDuration: ContractDuration = CONTRACT_DURATIONS.includes(
    (profile?.contract_duration ?? "") as ContractDuration,
  )
    ? (profile?.contract_duration as ContractDuration)
    : "12_MONTHS";

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
          regions: profile?.regions ?? [],
          startDate: profile?.start_date ?? "",
          contractType,
          contractDuration,
        }}
      />
    </main>
  );
}
