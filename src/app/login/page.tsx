import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";
import { resolvePostAuthRedirect } from "@/lib/auth-session";

type Props = {
  searchParams: Promise<{ email?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { email, error } = await searchParams;
  const user = await getCurrentUser();

  if (user) {
    redirect(await resolvePostAuthRedirect(user));
  }

  const initialEmail = typeof email === "string" ? email : undefined;
  const initialError = typeof error === "string" ? decodeURIComponent(error) : undefined;

  return (
    <AuthPageShell>
      <LoginForm initialEmail={initialEmail} initialError={initialError} />
    </AuthPageShell>
  );
}
