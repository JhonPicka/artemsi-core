"use client";

import { useActionState } from "react";

import { resendSetupEmailAction, type AuthFormState } from "@/app/(auth)/actions";

const initialState: AuthFormState = {};

type Props = {
  email: string;
};

export function ResendEmailButton({ email }: Props) {
  const [state, action, pending] = useActionState(resendSetupEmailAction, initialState);

  return (
    <form action={action}>
      <input type="hidden" name="email" value={email} />
      {state.error ? <p className="error">{state.error}</p> : null}
      {state.success ? (
        <p className="success">{state.success}</p>
      ) : (
        <button type="submit" className="button-link secondary-link" disabled={pending}>
          {pending ? "Envoi..." : "Renvoyer l'email d'activation"}
        </button>
      )}
    </form>
  );
}
