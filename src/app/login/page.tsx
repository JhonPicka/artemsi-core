import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getFreshLoginPath } from "@/lib/auth-paths";
import { getCurrentUser } from "@/lib/auth";

type Props = {
  searchParams: Promise<{ email?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { email, error } = await searchParams;
  const user = await getCurrentUser();

  // Session persistante : on efface les cookies pour permettre un autre email.
  if (user) {
    redirect(
      getFreshLoginPath(typeof email === "string" ? { email } : undefined),
    );
  }

  const initialEmail = typeof email === "string" ? email : undefined;
  const initialError = typeof error === "string" ? decodeURIComponent(error) : undefined;

  return (
    <AuthPageShell>
      <LoginForm initialEmail={initialEmail} initialError={initialError} />
    </AuthPageShell>
  );
}
