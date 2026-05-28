"use client";

import Link from "next/link";
import { useActionState } from "react";

import { sendMagicLinkAction, type AuthFormState } from "@/app/(auth)/actions";

const initialState: AuthFormState = {};

type Props = {
  initialEmail?: string;
};

export function LoginForm({ initialEmail }: Props) {
  const [state, action, pending] = useActionState(sendMagicLinkAction, initialState);

  return (
    <form className="card form" action={action}>
      <span className="brand-chip">ACCES</span>
      <h1>Accede a ton espace</h1>
      <p className="muted">
        Entre l&apos;email de ton abonnement. On t&apos;envoie un lien securise.
      </p>

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required defaultValue={initialEmail ?? ""} />

      {state.error ? <p className="error">{state.error}</p> : null}
      {state.success ? <p className="success">{state.success}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Envoi en cours..." : "M'envoyer le lien"}
      </button>

      <p className="muted auth-form-footer">
        Deja abonne ? Utilise l&apos;email du paiement Stripe.
        {" · "}
        <Link href="/subscribe">Abonnement</Link>
      </p>
    </form>
  );
}
