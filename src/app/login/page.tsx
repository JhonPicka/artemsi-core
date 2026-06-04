import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { resolveLoginPageRedirect } from "@/lib/auth-session";
import { getCurrentUser } from "@/lib/auth";
import { syncUserBilling, userHasBillingAccess } from "@/lib/billing";

type Props = {
  searchParams: Promise<{ email?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const user = await getCurrentUser();

  if (user) {
    const target = await resolveLoginPageRedirect(user);
    if (target) {
      redirect(target);
    }

    if (user.email) {
      await syncUserBilling(user);
      if (!(await userHasBillingAccess(user.email))) {
        redirect(
          `/api/auth/reset-session?email=${encodeURIComponent(user.email)}`,
        );
      }
    }
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
