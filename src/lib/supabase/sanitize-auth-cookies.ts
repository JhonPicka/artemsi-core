type CookieLike = { name: string; value: string };

const AUTH_COOKIE_CHUNK_SUFFIX = /\.(0|[1-9][0-9]*)$/;

function isSupabaseAuthCookieName(name: string): boolean {
  return name.startsWith("sb-") && name.includes("-auth-token");
}

function isAuthCookieChunk(name: string): boolean {
  return isSupabaseAuthCookieName(name) && AUTH_COOKIE_CHUNK_SUFFIX.test(name);
}

/**
 * Ne supprime que les cookies auth non fragmentés manifestement invalides
 * (ex. "invalidgarbage"). Les morceaux sb-*-auth-token.0/.1 ne sont jamais jugés seuls.
 */
export function listObviouslyCorruptAuthCookieNames(cookies: CookieLike[]): string[] {
  return cookies
    .filter((cookie) => {
      if (!isSupabaseAuthCookieName(cookie.name) || isAuthCookieChunk(cookie.name)) {
        return false;
      }

      const value = cookie.value.trim();
      if (!value) return true;

      return !value.startsWith("base64-") && !value.startsWith("{");
    })
    .map((cookie) => cookie.name);
}

export function clearSupabaseAuthCookiesOnResponse(
  response: { cookies: { set: (name: string, value: string, options?: object) => void } },
  cookieNames: string[],
) {
  for (const name of cookieNames) {
    response.cookies.set(name, "", { maxAge: 0, path: "/" });
  }
}
