"use client";

import { useState } from "react";

import { DeleteAccountForm } from "@/components/profile/delete-account-form";

type Props = {
  variant?: "standalone" | "embedded";
};

export function DeleteAccountPanel({ variant = "standalone" }: Props) {
  const embedded = variant === "embedded";
  const [open, setOpen] = useState(false);

  return (
    <div
      className={[
        "delete-account-panel",
        embedded ? "delete-account-panel--embedded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="delete-account-head">
        <div>
          <p className="delete-account-title">Supprimer mon compte</p>
          <p className="muted delete-account-lead">
            Action définitive : profil, candidatures, documents et accès seront effacés.
          </p>
        </div>
        <button
          type="button"
          className="secondary delete-account-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          {open ? "Fermer" : "Continuer"}
        </button>
      </div>

      {open ? (
        <div className="delete-account-body">
          <DeleteAccountForm />
        </div>
      ) : null}
    </div>
  );
}
