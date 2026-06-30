import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { userNeedsPasswordSetup } from "@/lib/account-setup";
import { getFreshLoginPath } from "@/lib/auth-paths";
import { createSetupToken } from "@/lib/setup-token";
import { createClientFromRequest } from "@/lib/supabase/route-handler";

const OTP_TYPES: EmailOtpType[] = ["invite", "signup", "recovery", "magiclink", "email"];

function safeNextPath(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/signup/finish";
  }
  return raw;
}

async function redirectAfterOtpSuccess(
  request: NextRequest,
  response: NextResponse,
  supabase: ReturnType<typeof createClientFromRequest>,
  next: string,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email && user.id && userNeedsPasswordSetup(user)) {
    const token = createSetupToken({ email: user.email, userId: user.id });
    const finishUrl = new URL("/signup/finish", request.url);
    finishUrl.searchParams.set("setup_token", token);
    return NextResponse.redirect(finishUrl);
  }

  if (next !== "/signup/finish") {
    return NextResponse.redirect(new URL(next, request.url));
  }

  return response;
}

/** Callback serveur : échange token_hash/code et persiste les cookies de session. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const next = safeNextPath(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  let response = NextResponse.redirect(new URL(next, request.url));
  const supabase = createClientFromRequest(request, response);

  if (tokenHash) {
    const typesToTry = type ? [type, ...OTP_TYPES.filter((t) => t !== type)] : OTP_TYPES;
    for (const otpType of typesToTry) {
      const { error } = await supabase.auth.verifyOtp({
        type: otpType,
        token_hash: tokenHash,
      });
      if (!error) {
        return redirectAfterOtpSuccess(request, response, supabase, next);
      }
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirectAfterOtpSuccess(request, response, supabase, next);
    }
  }

  return NextResponse.redirect(
    new URL(getFreshLoginPath({ error: "Lien invalide ou expiré." }), request.url),
  );
}
