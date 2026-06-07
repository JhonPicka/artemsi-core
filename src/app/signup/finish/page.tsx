import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { FinishSignupForm } from "@/components/auth/finish-signup-form";
import { getFreshLoginPath } from "@/lib/auth-paths";
import { needsPasswordSetup, resolvePostAuthRedirect } from "@/lib/auth-session";
import { getCurrentUser } from "@/lib/auth";
import { verifySetupToken } from "@/lib/setup-token";

type Props = {
  searchParams: Promise<{ error?: string; setup_token?: string }>;
};

export default async function SignupFinishPage({ searchParams }: Props) {
  const { error, setup_token: setupToken } = await searchParams;
  const initialError = typeof error === "string" ? decodeURIComponent(error) : undefined;

  if (typeof setupToken === "string" && setupToken.length > 0) {
    const payload = verifySetupToken(setupToken);
    if (!payload) {
      redirect(
        "/activer-mon-compte?error=" +
          encodeURIComponent("Lien d'activation expiré. Relance « Activer mon compte »."),
      );
    }

    return (
      <AuthPageShell>
        <FinishSignupForm
          email={payload.email}
          setupToken={setupToken}
          initialError={initialError}
        />
      </AuthPageShell>
    );
  }

  const user = await getCurrentUser();

  if (!user?.email) {
    redirect(
      getFreshLoginPath({
        error: "Ouvre le lien dans ton email ou va sur Activer mon compte.",
      }),
    );
  }

  if (!needsPasswordSetup(user)) {
    redirect(await resolvePostAuthRedirect(user));
  }

  return (
    <AuthPageShell>
      <FinishSignupForm email={user.email} initialError={initialError} />
    </AuthPageShell>
  );
}
