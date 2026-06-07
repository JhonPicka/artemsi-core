"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";

import { getFreshLoginPath } from "@/lib/auth-paths";
import { createClient } from "@/lib/supabase/client";

const OTP_TYPES: EmailOtpType[] = ["invite", "signup", "recovery", "magiclink", "email"];

function safeNextPath(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/signup/finish";
  }
  return raw;
}

export function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const supabase = createClient();
    const next = safeNextPath(searchParams.get("next"));
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    async function finish() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        fail();
        return;
      }
      router.replace(next);
      router.refresh();
    }

    function fail() {
      router.replace(
        getFreshLoginPath({ error: "Lien invalide ou expiré." }),
      );
    }

    async function handle() {
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") as EmailOtpType | null;

      if (tokenHash) {
        const typesToTry = type ? [type, ...OTP_TYPES.filter((t) => t !== type)] : OTP_TYPES;
        for (const otpType of typesToTry) {
          const { error } = await supabase.auth.verifyOtp({
            type: otpType,
            token_hash: tokenHash,
          });
          if (!error) {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            if (session) {
              await finish();
              return;
            }
          }
        }
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            await finish();
            return;
          }
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await finish();
        return;
      }

      timeoutId = setTimeout(fail, 5000);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
          if (timeoutId) clearTimeout(timeoutId);
          subscription.unsubscribe();
          void finish();
        }
      });

      return () => subscription.unsubscribe();
    }

    let cleanup: (() => void) | undefined;
    void handle().then((fn) => {
      cleanup = fn;
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      cleanup?.();
    };
  }, [router, searchParams]);

  return (
    <div className="card form" style={{ textAlign: "center" }}>
      <p className="muted">Connexion en cours…</p>
    </div>
  );
}
