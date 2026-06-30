"use client";

import { useEffect, useRef } from "react";

import { trackActivity } from "@/lib/track-activity-client";

type Props = {
  eventType: string;
  payload?: Record<string, string | number | boolean | null>;
};

/** Enregistre une vue de page une seule fois au montage. */
export function ActivityPageTracker({ eventType, payload }: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackActivity(eventType, payload);
  }, [eventType, payload]);

  return null;
}
