function buildResetSessionPath(params?: { email?: string; error?: string; next?: string }) {
  const search = new URLSearchParams();
  const email = params?.email?.trim().toLowerCase();
  if (email) search.set("email", email);
  if (params?.error) search.set("error", params.error);
  if (params?.next) search.set("next", params.next);
  const query = search.toString();
  return query ? `/api/auth/reset-session?${query}` : "/api/auth/reset-session";
}

/** Ouvre /login avec session effacée (changement de compte possible). */
export function getFreshLoginPath(params?: { email?: string; error?: string }) {
  return buildResetSessionPath(params);
}

/** Inscription : efface la session puis ouvre le formulaire (CTA landing). */
export function getFreshSignupPath() {
  return buildResetSessionPath({ next: "/signup" });
}
