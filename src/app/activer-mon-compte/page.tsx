import { redirect } from "next/navigation";

import { ActivatePaidAccountForm } from "@/components/auth/activate-paid-account-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { needsPasswordSetup, resolvePostAuthRedirect } from "@/lib/auth-session";
import { getCurrentUser } from "@/lib/auth";

type Props = {
  searchParams: Promise<{ email?: string }>;
};

export default async function ActivatePaidAccountPage({ searchParams }: Props) {
  const user = await getCurrentUser();

  if (user) {
    if (needsPasswordSetup(user)) {
      redirect("/signup/finish");
    }
    redirect(await resolvePostAuthRedirect(user));
  }

  const { email } = await searchParams;
  const initialEmail = typeof email === "string" ? email : undefined;

  return (
    <AuthPageShell>
      <ActivatePaidAccountForm initialEmail={initialEmail} />
    </AuthPageShell>
  );
}
