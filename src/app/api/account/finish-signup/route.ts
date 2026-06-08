import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getFreshLoginPath } from "@/lib/auth-paths";
import { isAdminUser } from "@/lib/admin-auth";
import { resolveAdminPostAuthPath } from "@/lib/admin-profile";
import { syncUserBilling, userHasBillingAccess } from "@/lib/billing";
import { finishSignupWithToken } from "@/lib/paid-account-activation";
import {
  createClientFromRequest,
  redirectWithCookies,
} from "@/lib/supabase/route-handler";
import { setPasswordSchema } from "@/lib/validation";

async function resolveRedirectAfterPassword(
  user: { id: string; email?: string | null },
  supabase: SupabaseClient,
) {
  if (isAdminUser(user)) {
    return await resolveAdminPostAuthPath(user);
  }

  if (!user.email) {
    return "/login";
  }

  await syncUserBilling({ id: user.id, email: user.email });
  if (!(await userHasBillingAccess(user.email))) {
    return "/subscribe";
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed) {
    return "/onboarding";
  }

  return "/dashboard";
}

function finishErrorRedirect(
  request: NextRequest,
  message: string,
  setupToken?: string | null,
) {
  const url = new URL("/signup/finish", request.url);
  url.searchParams.set("error", message);
  if (setupToken) {
    url.searchParams.set("setup_token", setupToken);
  }
  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const setupToken =
    typeof formData.get("setup_token") === "string"
      ? (formData.get("setup_token") as string)
      : null;

  const parsed = setPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptLegal: formData.get("acceptLegal")?.toString(),
  });

  if (!parsed.success) {
    return finishErrorRedirect(
      request,
      parsed.error.issues[0]?.message ?? "Formulaire invalide",
      setupToken,
    );
  }

  let response = NextResponse.redirect(new URL("/signup/finish", request.url));
  const supabase = createClientFromRequest(request, response);

  if (setupToken) {
    const result = await finishSignupWithToken(
      { setupToken, password: parsed.data.password },
      supabase,
    );

    if (!result.ok) {
      return finishErrorRedirect(request, result.error, setupToken);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.redirect(
        new URL(
          getFreshLoginPath({
            error: "Mot de passe enregistré. Connecte-toi avec ton nouveau mot de passe.",
          }),
          request.url,
        ),
      );
    }

    const target = await resolveRedirectAfterPassword(user, supabase);
    return redirectWithCookies(request, response, target);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(
      new URL(
        getFreshLoginPath({
          error:
            "Session expirée. Retourne sur « Activer mon compte » et relance la création.",
        }),
        request.url,
      ),
    );
  }

  const { error: passwordError } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (passwordError) {
    return finishErrorRedirect(request, passwordError.message);
  }

  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      password_setup_pending: false,
      password_set: true,
    },
  });

  if (metadataError) {
    return finishErrorRedirect(request, metadataError.message);
  }

  const {
    data: { user: refreshed },
  } = await supabase.auth.getUser();

  if (!refreshed?.email) {
    return NextResponse.redirect(
      new URL(
        getFreshLoginPath({ error: "Session perdue après enregistrement. Réessaie l'activation." }),
        request.url,
      ),
    );
  }

  const target = await resolveRedirectAfterPassword(refreshed, supabase);
  return redirectWithCookies(request, response, target);
}
