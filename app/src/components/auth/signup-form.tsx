"use client";

import { useActionState } from "react";

import Link from "next/link";

import { signupAction, type AuthFormState } from "@/app/(auth)/actions";
import { billingFreeSignupLead } from "@/lib/billing-offer";
import { legalRoutes } from "@/lib/legal-config";

const initialState: AuthFormState = {};

export function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, initialState);

  return (
    <form className="card form" action={action} autoComplete="off">
      <span className="brand-chip">INSCRIPTION</span>
      <h1>Créer un compte</h1>
      <p className="muted">{billingFreeSignupLead()}</p>

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required autoComplete="email" />

      <label htmlFor="password">Mot de passe</label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="new-password"
      />

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
          <Link href={legalRoutes.terms} className="inline-link">
            CGU & CGV
          </Link>{" "}
          et la{" "}
          <Link href={legalRoutes.privacy} className="inline-link">
            politique de confidentialité
          </Link>
          .
        </span>
      </label>

      {state.error ? <p className="error">{state.error}</p> : null}
      {state.success ? <p className="success">{state.success}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Création..." : "S'inscrire"}
      </button>

      <div className="auth-form-footer">
        <p className="muted auth-form-footer-line">
          <Link href="/#landing-prix" className="inline-link">
            Comparer Gratuit et Pro
          </Link>
        </p>
        <p className="muted auth-form-footer-line">
          Déjà inscrit ?{" "}
          <Link href="/login" className="inline-link">
            Se connecter
          </Link>
        </p>
      </div>
    </form>
  );
}
