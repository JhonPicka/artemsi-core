import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { needsPasswordSetup, resolvePostAuthRedirect } from "@/lib/auth-session";
import { getCurrentUser } from "@/lib/auth";

type Props = {
  searchParams: Promise<{ email?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
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
      <SignupForm initialEmail={initialEmail} />
    </AuthPageShell>
  );
}
