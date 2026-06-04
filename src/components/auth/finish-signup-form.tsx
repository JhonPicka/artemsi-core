"use client";

import Link from "next/link";
import { useActionState } from "react";

import { finishSignupAction, type AuthFormState } from "@/app/(auth)/actions";
import { legalRoutes } from "@/lib/legal-config";

const initialState: AuthFormState = {};

type Props = {
  email: string;
};

export function FinishSignupForm({ email }: Props) {
  const [state, action, pending] = useActionState(finishSignupAction, initialState);

  return (
    <form className="card form" action={action}>
      <span className="brand-chip">ACTIVATION</span>
      <h1>Choisis ton mot de passe</h1>
      <p className="muted">
        Ton email est confirmé. Définis le mot de passe de ton espace ARTEMSI (utilise le même
        email que lors du paiement Stripe).
      </p>

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" value={email} readOnly disabled />

      <label htmlFor="password">Mot de passe</label>
      <input id="password" name="password" type="password" required autoComplete="new-password" />

      <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
      <input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        required
        autoComplete="new-password"
      />

      <label className="legal-consent">
        <input type="checkbox" name="acceptLegal" value="on" required />
        <span>
          J&apos;accepte les{" "}
          <Link href={legalRoutes.terms} target="_blank" rel="noopener noreferrer">
            CGU & CGV
          </Link>{" "}
          et la{" "}
          <Link href={legalRoutes.privacy} target="_blank" rel="noopener noreferrer">
            politique de confidentialité
          </Link>
          .
        </span>
      </label>

      {state.error ? <p className="error">{state.error}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Enregistrement..." : "Activer mon compte"}
      </button>

      <p className="muted auth-form-footer">
        Déjà un mot de passe ? <Link href="/login">Se connecter</Link>
      </p>
    </form>
  );
}
