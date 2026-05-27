"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signupAction, type AuthFormState } from "@/app/(auth)/actions";
import { SubscribeButton } from "@/components/billing/subscribe-button";
import { legalRoutes } from "@/lib/legal-config";

const initialState: AuthFormState = {};

type Props = {
  initialEmail?: string;
};

export function SignupForm({ initialEmail }: Props) {
  const [state, action, pending] = useActionState(signupAction, initialState);

  return (
    <form className="card form" action={action}>
      <span className="brand-chip">INSCRIPTION</span>
      <h1>Creer mon compte ARTEMSI</h1>
      <p className="muted">
        Utilise le <strong>meme email</strong> que lors du paiement Stripe, puis complete ton
        profil candidat.
      </p>

      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        required
        defaultValue={initialEmail ?? ""}
        readOnly={Boolean(initialEmail)}
      />

      <label htmlFor="password">Mot de passe</label>
      <input id="password" name="password" type="password" required />

      <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
      <input id="confirmPassword" name="confirmPassword" type="password" required />

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
      {state.success ? <p className="success">{state.success}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Creation en cours..." : "Creer mon compte"}
      </button>

      <p className="muted">
        Deja un compte ? <Link href="/login">Se connecter</Link>
      </p>

      <p className="muted">
        Pas encore abonne ?{" "}
        <SubscribeButton className="inline-link-button">Souscrire — 19,90&nbsp;EUR / mois</SubscribeButton>
      </p>
    </form>
  );
}
