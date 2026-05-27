import { env } from "@/lib/env";

function loadBypassEmails(): Set<string> {
  const emails = new Set<string>();

  const fromEnv = process.env.BILLING_BYPASS_EMAILS?.split(",") ?? [];
  for (const raw of fromEnv) {
    const normalized = raw.trim().toLowerCase();
    if (normalized) emails.add(normalized);
  }

  if (env.ADMIN_EMAIL) {
    emails.add(env.ADMIN_EMAIL.trim().toLowerCase());
  }

  return emails;
}

let cached: Set<string> | null = null;

export function getBillingBypassEmails(): string[] {
  if (!cached) cached = loadBypassEmails();
  return [...cached];
}

export function isBillingBypassEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  if (!cached) cached = loadBypassEmails();
  return cached.has(email.trim().toLowerCase());
}
