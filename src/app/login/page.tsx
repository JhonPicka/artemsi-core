import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { needsPasswordSetup, resolvePostAuthRedirect } from "@/lib/auth-session";
import { getCurrentUser } from "@/lib/auth";

type Props = {
  searchParams: Promise<{ email?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (user) {
    if (needsPasswordSetup(user)) {
      redirect("/signup/finish");
    }
    redirect(await resolvePostAuthRedirect(user));
  }

  const { email, error } = await searchParams;
  const initialEmail = typeof email === "string" ? email : undefined;
  const initialError = typeof error === "string" ? decodeURIComponent(error) : undefined;

  return (
    <AuthPageShell>
      <LoginForm initialEmail={initialEmail} initialError={initialError} />
    </AuthPageShell>
  );
}
