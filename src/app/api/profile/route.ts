import { NextResponse } from "next/server";

import { assignMatchingOffersToUser } from "@/lib/match-user-offers";
import { hasApiBillingAccess } from "@/lib/billing";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await hasApiBillingAccess(user))) {
    return NextResponse.json({ error: "Abonnement actif requis." }, { status: 402 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = onboardingSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  const profileUpsert = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      school_name: parsed.data.schoolName,
      study_level: parsed.data.studyLevel,
      study_domain: parsed.data.studyDomain,
      target_job: parsed.data.targetJob,
      regions: parsed.data.regions,
      start_date: parsed.data.startDate,
      contract_type: parsed.data.contractType,
      contract_duration: parsed.data.contractDuration,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (profileUpsert.error) {
    return NextResponse.json({ error: profileUpsert.error.message }, { status: 500 });
  }

  const preferencesUpsert = await supabase.from("user_preferences").upsert(
    {
      user_id: user.id,
      search_regions: parsed.data.regions,
      target_job: parsed.data.targetJob,
      contract_type: parsed.data.contractType,
      contract_duration: parsed.data.contractDuration,
      study_domain: parsed.data.studyDomain,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (preferencesUpsert.error) {
    return NextResponse.json(
      { error: preferencesUpsert.error.message },
      { status: 500 },
    );
  }

  let offerAssignment: Awaited<ReturnType<typeof assignMatchingOffersToUser>> | null = null;
  try {
    offerAssignment = await assignMatchingOffersToUser(user.id);
  } catch {
    // Ne bloque pas l'onboarding si le matching echoue (ex. service role absent en dev).
  }

  return NextResponse.json({ ok: true, offerAssignment });
}
