"use client";

import { useActionState } from "react";

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
    <form className="card form" action={action}>
      <span className="brand-chip">CONNEXION</span>
      <h1>Connexion</h1>

      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        required
        defaultValue={initialEmail ?? ""}
        autoComplete="email"
      />

      <label htmlFor="password">Mot de passe</label>
      <input id="password" name="password" type="password" required autoComplete="current-password" />

      {displayError ? <p className="error">{displayError}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Connexion..." : "Se connecter"}
      </button>

      <p className="muted auth-form-footer">
        Pas encore abonné ?{" "}
        <a href="/#tarif" className="inline-link">
          Voir les offres
        </a>
      </p>
    </form>
  );
}
