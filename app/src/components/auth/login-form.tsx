"use client";

import { useActionState } from "react";

import Link from "next/link";

import { loginAction, type AuthFormState } from "@/app/(auth)/actions";

const initialState: AuthFormState = {};

type Props = {
  initialEmail?: string;
  initialError?: string;
};

export function LoginForm({ initialEmail, initialError }: Props) {
  const [state, action, pending] = useActionState(loginAction, initialState);
  const displayError = state.error ?? initialError;

  return (
    <form className="card form" action={action} autoComplete="off">
      <span className="brand-chip">CONNEXION</span>
      <h1>Connexion</h1>
      <p className="muted">
        Connecte-toi avec l&apos;email et le mot de passe choisis à l&apos;inscription.
      </p>

      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        required
        defaultValue={initialEmail ?? ""}
        autoComplete="username"
      />

      <label htmlFor="password">Mot de passe</label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
      />

      {displayError ? <p className="error">{displayError}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Connexion..." : "Se connecter"}
      </button>

      <div className="auth-form-footer">
        <p className="muted auth-form-footer-line">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="inline-link">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </form>
  );
}
