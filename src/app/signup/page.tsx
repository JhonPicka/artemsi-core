import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignupForm } from "@/components/auth/signup-form";

type Props = {
  searchParams: Promise<{ email?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const { email } = await searchParams;
  const initialEmail = typeof email === "string" ? email : undefined;

  return (
    <AuthPageShell>
      <SignupForm initialEmail={initialEmail} />
    </AuthPageShell>
  );
}
