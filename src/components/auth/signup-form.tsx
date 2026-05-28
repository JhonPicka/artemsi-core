"use client";

import Link from "next/link";
import { useActionState } from "react";

import { sendMagicLinkAction, type AuthFormState } from "@/app/(auth)/actions";
import { SubscribeButton } from "@/components/billing/subscribe-button";

const initialState: AuthFormState = {};

type Props = {
  initialEmail?: string;
};

export function SignupForm({ initialEmail }: Props) {
  const [state, action, pending] = useActionState(sendMagicLinkAction, initialState);

  return (
    <form className="card form" action={action}>
      <span className="brand-chip">ACTIVATION</span>
      <h1>Active ton acces ARTEMSI</h1>
      <p className="muted">
        Utilise le <strong>meme email</strong> que lors du paiement Stripe. On t&apos;envoie un lien
        securise pour te connecter.
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

      {state.error ? <p className="error">{state.error}</p> : null}
      {state.success ? <p className="success">{state.success}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Envoi en cours..." : "M'envoyer le lien"}
      </button>

      <p className="muted">
        Deja abonne ? <Link href="/login">Recevoir un lien de connexion</Link>
      </p>

      <p className="muted">
        Pas encore abonne ?{" "}
        <SubscribeButton className="inline-link-button">Souscrire — 19,90&nbsp;EUR / mois</SubscribeButton>
      </p>
    </form>
  );
}
