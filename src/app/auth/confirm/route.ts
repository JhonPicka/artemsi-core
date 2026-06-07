import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { getFreshLoginPath } from "@/lib/auth-paths";
import { createClientFromRequest } from "@/lib/supabase/route-handler";

const OTP_TYPES: EmailOtpType[] = ["invite", "signup", "recovery", "magiclink", "email"];

function safeNextPath(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/signup/finish";
  }
  return raw;
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
        return response;
      }
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
  }

  return NextResponse.redirect(
    new URL(getFreshLoginPath({ error: "Lien invalide ou expiré." }), request.url),
  );
}
