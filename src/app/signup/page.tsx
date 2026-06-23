import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LandingPlanCompare } from "@/components/landing/landing-plan-compare";
import { resolvePostAuthRedirect } from "@/lib/auth-session";
import { getCurrentUser } from "@/lib/auth";

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(await resolvePostAuthRedirect(user));
  }

  return (
    <AuthPageShell wide>
      <LandingPlanCompare variant="auth" />
    </AuthPageShell>
  );
}
