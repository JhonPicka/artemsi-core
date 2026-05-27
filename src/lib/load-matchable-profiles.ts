import type { SupabaseClient } from "@supabase/supabase-js";

import type { MatchableProfile } from "@/lib/offer-matching";

export async function loadMatchableProfiles(
  supabase: SupabaseClient,
): Promise<MatchableProfile[]> {
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id,target_job,regions,contract_type,study_domain,onboarding_completed")
    .eq("onboarding_completed", true);

  if (profilesError) throw new Error(`Read profiles failed: ${profilesError.message}`);

  const rows = profiles ?? [];
  if (rows.length === 0) return [];

  const ids = rows.map((p) => p.id as string);
  const keywordsByUser = new Map<string, string[]>();
  for (const id of ids) keywordsByUser.set(id, []);

  const { data: prefs, error: prefsError } = await supabase
    .from("user_preferences")
    .select("user_id, interest_keywords")
    .in("user_id", ids);

  if (prefsError) {
    // Migration 20260520200000_offer_interests pas encore appliquee en prod
    if (!/interest_keywords/i.test(prefsError.message)) {
      throw new Error(`Read preferences failed: ${prefsError.message}`);
    }
  } else {
    for (const pref of prefs ?? []) {
      keywordsByUser.set(
        pref.user_id as string,
        (pref.interest_keywords as string[]) ?? [],
      );
    }
  }

  return rows.map((p) => ({
    id: p.id as string,
    target_job: p.target_job as string | null,
    regions: p.regions as string[] | null,
    contract_type: p.contract_type as string | null,
    study_domain: p.study_domain as string | null,
    interest_keywords: keywordsByUser.get(p.id as string) ?? [],
  }));
}
