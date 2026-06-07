import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { FinishSignupForm } from "@/components/auth/finish-signup-form";
import { getFreshLoginPath } from "@/lib/auth-paths";
import { needsPasswordSetup, resolvePostAuthRedirect } from "@/lib/auth-session";
import { getCurrentUser } from "@/lib/auth";

export default async function SignupFinishPage() {
  const user = await getCurrentUser();

  if (!user?.email) {
    redirect(
      getFreshLoginPath({
        error: "Ouvre le lien dans ton email pour activer ton compte.",
      }),
    );
  }

  if (!needsPasswordSetup(user)) {
    redirect(await resolvePostAuthRedirect(user));
  }

  return (
    <AuthPageShell>
      <FinishSignupForm email={user.email} />
    </AuthPageShell>
  );
}
