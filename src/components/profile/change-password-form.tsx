"use client";

import { useActionState, useEffect, useRef } from "react";

import { changePasswordAction, type AuthFormState } from "@/app/(auth)/actions";

const initialState: AuthFormState = {};

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} className="change-password-form" action={action}>
      <label htmlFor="currentPassword">Mot de passe actuel</label>
      <input
        id="currentPassword"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        required
      />

      <label htmlFor="newPassword">Nouveau mot de passe</label>
      <input
        id="newPassword"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
      />
      <p className="muted small-label">
        8 caractères minimum, avec au moins une minuscule, une majuscule et un chiffre.
      </p>

      <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
      <input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
      />

      {state.error ? (
        <p className="error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="success" role="status">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        className="button-link secondary-link"
        disabled={pending}
      >
        {pending ? "Mise à jour…" : "Mettre à jour le mot de passe"}
      </button>
    </form>
  );
}
