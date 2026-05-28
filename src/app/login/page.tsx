import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";

type Props = {
  searchParams: Promise<{ email?: string; error?: string; success?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { email, error, success } = await searchParams;
  const initialEmail = typeof email === "string" ? email : undefined;

  return (
    <AuthPageShell>
      <div className="stack-sm" style={{ width: "100%" }}>
        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">{success}</p> : null}
        <LoginForm initialEmail={initialEmail} />
      </div>
    </AuthPageShell>
  );
}
