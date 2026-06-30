import type { SupabaseClient, User } from "@supabase/supabase-js";

/** Session invalide ou cookie corrompu → déconnexion silencieuse, pas de crash Vercel. */
export async function safeGetUser(supabase: SupabaseClient): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      await supabase.auth.signOut();
      return null;
    }
    return data.user;
  } catch {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore — nettoyage best-effort
    }
    return null;
  }
}
