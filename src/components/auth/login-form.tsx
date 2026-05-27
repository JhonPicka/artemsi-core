"use client";

import { useActionState } from "react";

import { loginAction, type AuthFormState } from "@/app/(auth)/actions";
import { SubscribeButton } from "@/components/billing/subscribe-button";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form className="card form" action={action}>
      <span className="brand-chip">CONNEXION</span>
      <h1>Connexion</h1>
      <p className="muted">Accede a ton espace candidat ARTEMSI.</p>

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />

      <label htmlFor="password">Mot de passe</label>
      <input id="password" name="password" type="password" required />

      {state.error ? <p className="error">{state.error}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Connexion..." : "Se connecter"}
      </button>

      <p className="muted auth-form-footer">
        Pas encore abonné ?{" "}
        <SubscribeButton className="inline-link-button">
          Souscrire pour créer un compte
        </SubscribeButton>
      </p>
    </form>
  );
}
