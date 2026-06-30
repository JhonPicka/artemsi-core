import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { env } from "@/lib/env";

export const DEFAULT_ADMIN_EMAIL = "admin@artemsi.com";

export function getAdminEmail(): string {
  return (env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
}

export function getAdminUserId(): string | null {
  const value = env.ADMIN_USER_ID?.trim();
  return value ? value : null;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === getAdminEmail();
}

export function isAdminUser(input: { id?: string | null; email?: string | null } | null | undefined): boolean {
  if (!input) return false;
  const adminUserId = getAdminUserId();
  if (!adminUserId) return false;
  return input.id === adminUserId;
}

/** Compte interne : pas de parcours candidat (onboarding / abonnement). */
export function getAdminHomePath(): string {
  return "/admin";
}

export function getAdminAuditsPath(): string {
  return "/admin/audits";
}

export function getPostLoginPath(user: { id?: string | null; email?: string | null } | null | undefined): string {
  return isAdminUser(user) ? getAdminHomePath() : "/dashboard";
}

/** Page admin : utilisateur connecte + identite admin immuable. */
export async function requireAdminUser() {
  const user = await requireUser();
  if (!isAdminUser(user)) {
    redirect("/dashboard");
  }
  return user;
}
