/** Ouvre /login avec session effacée (changement de compte possible). */
export function getFreshLoginPath(params?: { email?: string; error?: string }) {
  const search = new URLSearchParams();
  const email = params?.email?.trim().toLowerCase();
  if (email) search.set("email", email);
  if (params?.error) search.set("error", params.error);
  const query = search.toString();
  return query ? `/api/auth/reset-session?${query}` : "/api/auth/reset-session";
}
