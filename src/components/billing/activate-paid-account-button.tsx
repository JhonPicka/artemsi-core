"use client";

import { useActionState } from "react";

import { activatePaidAccountAction, type AuthFormState } from "@/app/(auth)/actions";

const initialState: AuthFormState = {};

type Props = {
  email: string;
};

export function ActivatePaidAccountButton({ email }: Props) {
  const [state, action, pending] = useActionState(activatePaidAccountAction, initialState);

  return (
    <form action={action} className="activate-paid-account-form">
      <input type="hidden" name="email" value={email} />
      {state.error ? <p className="error">{state.error}</p> : null}
      <button type="submit" className="button-link" disabled={pending}>
        {pending ? "Activation..." : "Créer mon compte sans email"}
      </button>
    </form>
  );
}
