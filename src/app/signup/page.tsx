import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { isAdminEmail } from "@/lib/admin-auth";
import { isBillingBypassEmail } from "@/lib/billing-access";
import { userHasBillingAccess } from "@/lib/billing";
import { isBillingEnforced } from "@/lib/stripe";

type Props = {
  searchParams: Promise<{ email?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const { email } = await searchParams;
  const initialEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (isBillingEnforced()) {
    const isPrivileged =
      initialEmail && (isAdminEmail(initialEmail) || isBillingBypassEmail(initialEmail));

    if (!initialEmail || (!isPrivileged && !(await userHasBillingAccess(initialEmail)))) {
      redirect("/subscribe");
    }
  }

  return (
    <AuthPageShell>
      <SignupForm initialEmail={initialEmail || undefined} />
    </AuthPageShell>
  );
}
