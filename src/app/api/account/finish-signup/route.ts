import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getFreshLoginPath } from "@/lib/auth-paths";
import { getAdminHomePath, isAdminUser } from "@/lib/admin-auth";
import { syncUserBilling, userHasBillingAccess } from "@/lib/billing";
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
    return getAdminHomePath();
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

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const parsed = setPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptLegal: formData.get("acceptLegal")?.toString(),
  });

  if (!parsed.success) {
    const url = new URL("/signup/finish", request.url);
    url.searchParams.set("error", parsed.error.issues[0]?.message ?? "Formulaire invalide");
    return NextResponse.redirect(url);
  }

  let response = NextResponse.redirect(new URL("/signup/finish", request.url));
  const supabase = createClientFromRequest(request, response);

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
    const url = new URL("/signup/finish", request.url);
    url.searchParams.set("error", passwordError.message);
    return NextResponse.redirect(url);
  }

  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      password_setup_pending: false,
      password_set: true,
    },
  });

  if (metadataError) {
    const url = new URL("/signup/finish", request.url);
    url.searchParams.set("error", metadataError.message);
    return NextResponse.redirect(url);
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
