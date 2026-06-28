import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { resolvePostAuthRedirect } from "@/lib/auth-session";
import { getCurrentUser } from "@/lib/auth";

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(await resolvePostAuthRedirect(user));
  }

  return (
    <AuthPageShell>
      <SignupForm />
    </AuthPageShell>
  );
}
