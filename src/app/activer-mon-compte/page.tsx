import { redirect } from "next/navigation";

import { ActivatePaidAccountForm } from "@/components/auth/activate-paid-account-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { needsPasswordSetup, resolvePostAuthRedirect } from "@/lib/auth-session";
import { getCurrentUser } from "@/lib/auth";
import { preparePaidAccountPasswordSetup } from "@/lib/paid-account-activation";

type Props = {
  searchParams: Promise<{ email?: string; error?: string }>;
};

export default async function ActivatePaidAccountPage({ searchParams }: Props) {
  const user = await getCurrentUser();

  if (user) {
    if (needsPasswordSetup(user) && user.email) {
      const setup = await preparePaidAccountPasswordSetup(user.email);
      if (setup.ok) {
        redirect(`/signup/finish?setup_token=${setup.setupToken}`);
      }
      redirect("/signup/finish");
    }
    redirect(await resolvePostAuthRedirect(user));
  }

  const { email, error } = await searchParams;
  const initialEmail = typeof email === "string" ? email : undefined;
  const initialError = typeof error === "string" ? decodeURIComponent(error) : undefined;

  return (
    <AuthPageShell>
      <ActivatePaidAccountForm initialEmail={initialEmail} initialError={initialError} />
    </AuthPageShell>
  );
}
