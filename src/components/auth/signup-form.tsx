"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  resendSetupEmailAction,
  signupAction,
  type AuthFormState,
} from "@/app/(auth)/actions";
import { SubscribeButton } from "@/components/billing/subscribe-button";
import { legalRoutes } from "@/lib/legal-config";

const initialState: AuthFormState = {};

type Props = {
  initialEmail?: string;
};

export function SignupForm({ initialEmail }: Props) {
  const [state, action, pending] = useActionState(signupAction, initialState);
  const [resendState, resendAction, resendPending] = useActionState(
    resendSetupEmailAction,
    initialState,
  );

  return (
    <>
      <form className="card form" action={action}>
        <span className="brand-chip">SECOURS</span>
        <h1>Choisir mon mot de passe</h1>
        <p className="muted">
          Parcours normal : ouvre le <strong>lien dans l&apos;email</strong> reçu après paiement.
          Cette page sert si tu n&apos;as pas reçu l&apos;email — utilise le{" "}
          <strong>meme email</strong> que sur Stripe.
        </p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={initialEmail ?? ""}
          readOnly={Boolean(initialEmail)}
          disabled={Boolean(initialEmail)}
        />

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
        {state.success ? <p className="success">{state.success}</p> : null}

        <button type="submit" disabled={pending}>
          {pending ? "Enregistrement..." : "Creer mon compte"}
        </button>

        <p className="muted">
          Deja un mot de passe ? <Link href="/login">Se connecter</Link>
        </p>
      </form>

      {initialEmail ? (
        <form className="card form auth-resend-form" action={resendAction}>
          <p className="muted">Pas recu l&apos;email de confirmation ?</p>
          <input type="hidden" name="email" value={initialEmail} />
          {resendState.error ? <p className="error">{resendState.error}</p> : null}
          {resendState.success ? <p className="success">{resendState.success}</p> : null}
          <button type="submit" className="button-link secondary-link" disabled={resendPending}>
            {resendPending ? "Envoi..." : "Renvoyer le lien par email"}
          </button>
        </form>
      ) : null}

      <p className="muted auth-form-footer">
        Pas encore abonne ?{" "}
        <SubscribeButton className="inline-link-button">Souscrire — 19,90&nbsp;EUR / mois</SubscribeButton>
      </p>
    </>
  );
}
