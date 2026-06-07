import { Suspense } from "react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { AuthCallbackHandler } from "@/components/auth/auth-callback-handler";

export default function AuthCallbackPage() {
  return (
    <AuthPageShell>
      <Suspense
        fallback={
          <div className="card form" style={{ textAlign: "center" }}>
            <p className="muted">Connexion en cours…</p>
          </div>
        }
      >
        <AuthCallbackHandler />
      </Suspense>
    </AuthPageShell>
  );
}
