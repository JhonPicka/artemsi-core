import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";

export const USER_ACTIVITY_EVENTS = {
  OFFER_OPEN_EXTERNAL: "offer_open_external",
  OFFER_VIEW_MODAL: "offer_view_modal",
  OFFER_INTEREST_ADD: "offer_interest_add",
  OFFER_INTEREST_REMOVE: "offer_interest_remove",
  APPLICATION_CREATE: "application_create",
  OFFER_APPLY_CLICK: "offer_apply_click",
  DASHBOARD_VIEW: "dashboard_view",
  OFFERS_VIEW: "offers_view",
  APPLICATIONS_VIEW: "applications_view",
  PROFILE_VIEW: "profile_view",
  AUDIT_VIEW: "audit_view",
  LINK_REPORT: "link_report",
  SUBSCRIBE_CLICK: "subscribe_click",
} as const;

export type UserActivityEventType =
  (typeof USER_ACTIVITY_EVENTS)[keyof typeof USER_ACTIVITY_EVENTS];

export type UserActivityPayload = Record<string, string | number | boolean | null>;

export const USER_ACTIVITY_EVENT_LABELS: Record<string, string> = {
  offer_open_external: "Ouverture offre (site externe)",
  offer_view_modal: "Consultation détail offre",
  offer_interest_add: "Marqué intéressé",
  offer_interest_remove: "Retiré des intérêts",
  application_create: "Candidature ajoutée",
  offer_apply_click: "Clic Candidater",
  dashboard_view: "Vue accueil",
  offers_view: "Vue offres",
  applications_view: "Vue candidatures",
  profile_view: "Vue profil",
  audit_view: "Vue audit",
  link_report: "Signalement lien mort",
  subscribe_click: "Clic upgrade Pro",
};

export async function recordUserActivity(
  supabase: SupabaseClient,
  userId: string,
  eventType: string,
  payload: UserActivityPayload = {},
) {
  const { error } = await supabase.from("user_activity_events").insert({
    user_id: userId,
    event_type: eventType,
    payload,
  });
  if (error) {
    console.warn("[user-activity] insert failed:", error.message);
  }
}

export async function recordUserActivityAdmin(
  userId: string,
  eventType: string,
  payload: UserActivityPayload = {},
) {
  try {
    const admin = createAdminClient();
    await recordUserActivity(admin, userId, eventType, payload);
  } catch (cause) {
    console.warn("[user-activity] admin insert failed:", cause);
  }
}
