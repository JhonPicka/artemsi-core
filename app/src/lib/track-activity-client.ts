"use client";

import type { UserActivityPayload } from "@/lib/user-activity";

/** Envoie un événement d'activité (fire-and-forget, non bloquant). */
export function trackActivity(eventType: string, payload?: UserActivityPayload) {
  if (typeof window === "undefined") return;

  void fetch("/api/activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventType, payload: payload ?? {} }),
    keepalive: true,
  }).catch(() => {
    // silencieux — le tracking ne doit pas casser l'UX
  });
}
