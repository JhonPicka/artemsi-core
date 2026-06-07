import { env } from "@/lib/env";

export function getAppUrl() {
  return env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
