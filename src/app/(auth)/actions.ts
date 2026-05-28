"use server";

import { redirect } from "next/navigation";

import { userHasBillingAccess } from "@/lib/billing";
import { getAppUrl } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { authEmailSchema } from "@/lib/validation";

export type AuthFormState = {
  error?: string;
  success?: string;
};

const MAGIC_LINK_SENT_MESSAGE =
  "Lien envoye. Verifie ta boite mail (et spams) pour te connecter.";

export async function sendMagicLinkAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = authEmailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const email = parsed.data.email.trim().toLowerCase();
  if (!(await userHasBillingAccess(email))) {
    return {
      error:
        "Aucun abonnement actif pour cet email. Utilise l'email du paiement Stripe ou souscris d'abord.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getAppUrl()}/auth/callback`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: MAGIC_LINK_SENT_MESSAGE };
}

/** @deprecated Use sendMagicLinkAction instead. */
export const signupAction = sendMagicLinkAction;
/** @deprecated Use sendMagicLinkAction instead. */
export const loginAction = sendMagicLinkAction;

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
