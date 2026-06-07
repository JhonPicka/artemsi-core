"use client";

import Link from "next/link";
import { useActionState } from "react";

import { activatePaidAccountAction, type AuthFormState } from "@/app/(auth)/actions";

const initialState: AuthFormState = {};

type Props = {
  initialEmail?: string;
};

export function ActivatePaidAccountForm({ initialEmail }: Props) {
  const [state, action, pending] = useActionState(activatePaidAccountAction, initialState);

  return (
    <form className="card form" action={action}>
      <span className="brand-chip">ACTIVATION</span>
      <h1>Activer mon compte</h1>

      <p className="muted">
        Tu as payé ton abonnement mais l&apos;email d&apos;activation ne fonctionne pas ?
        Entre l&apos;adresse utilisée au paiement Stripe pour créer ton compte
        <strong> sans attendre l&apos;email</strong>.
      </p>

      <label htmlFor="email">Email utilisé au paiement</label>
      <input
        id="email"
        name="email"
        type="email"
        required
        defaultValue={initialEmail ?? ""}
        autoComplete="email"
      />

      {state.error ? <p className="error">{state.error}</p> : null}
      {state.success ? <p className="success">{state.success}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Activation..." : "Créer mon compte sans email"}
      </button>

      <p className="muted auth-form-footer" style={{ fontSize: "0.9rem" }}>
        Tu préfères recevoir un email ? Depuis la page de confirmation de paiement, utilise
        le bouton «&nbsp;Renvoyer l&apos;email&nbsp;».
        <br />
        Déjà un mot de passe ?{" "}
        <Link href="/login" className="inline-link">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
