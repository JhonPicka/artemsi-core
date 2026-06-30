/** Autorisation des routes cron (Vercel Cron ou appel manuel avec CRON_SECRET). */
export function cronSecrets(): string[] {
  const secret = process.env.CRON_SECRET?.trim();
  return secret ? [secret] : [];
}

export function isCronAuthorized(request: Request): boolean {
  const secrets = cronSecrets();
  if (secrets.length === 0) return false;

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice("Bearer ".length).trim();
    if (secrets.includes(token)) return true;
  }

  const cronHeader = request.headers.get("x-cron-secret");
  if (cronHeader && secrets.includes(cronHeader)) return true;

  return false;
}

export function cronUnauthorizedResponse() {
  return { error: "Unauthorized" as const, status: 401 as const };
}

export function cronMissingSecretResponse() {
  return { error: "CRON_SECRET manquant" as const, status: 500 as const };
}
