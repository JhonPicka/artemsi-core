import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { env } from "@/lib/env";

export const DEFAULT_ADMIN_EMAIL = "admin@artemsi.com";

export function getAdminEmail(): string {
  return (env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === getAdminEmail();
}

/** Compte interne : pas de parcours candidat (onboarding / abonnement). */
export function getAdminHomePath(): string {
  return "/admin";
}

export function getAdminAuditsPath(): string {
  return "/admin/audits";
}

export function getPostLoginPath(email: string | null | undefined): string {
  return isAdminEmail(email) ? getAdminHomePath() : "/dashboard";
}

/** Page admin : utilisateur connecte + email admin uniquement. */
export async function requireAdminUser() {
  const user = await requireUser();
  if (!isAdminEmail(user.email)) {
    redirect("/dashboard");
  }
  return user;
}
