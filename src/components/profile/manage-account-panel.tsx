"use client";

import { ManageSubscriptionButton } from "@/components/billing/manage-subscription-button";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { legalConfig } from "@/lib/legal-config";

export function ManageAccountPanel() {
  const contactSubject = encodeURIComponent("Demande de suppression de compte ARTEMSI");
  const contactHref = `mailto:${legalConfig.contactEmail}?subject=${contactSubject}`;

  return (
    <div className="manage-account-panel">
      <article className="manage-account-row">
        <p className="manage-account-row-title">Mot de passe</p>
        <p className="muted manage-account-row-lead">
          Change ton mot de passe à tout moment depuis ton espace ARTEMSI.
        </p>
        <ChangePasswordForm />
      </article>

      <div className="manage-account-divider" role="separator" />

      <article className="manage-account-row">
        <p className="manage-account-row-title">Annuler son abonnement</p>
        <p className="muted manage-account-row-lead">
          Portail Stripe : désabonnement, carte bancaire et factures (selon les{" "}
          <a href="/cgu" className="manage-account-link">
            CGU
          </a>
          ).
        </p>
        <ManageSubscriptionButton className="button-link secondary-link">
          Gérer ou annuler l&apos;abonnement
        </ManageSubscriptionButton>
      </article>

      <div className="manage-account-divider" role="separator" />

      <article className="manage-account-row manage-account-row--contact">
        <p className="manage-account-row-title">Supprimer mon compte</p>
        <p className="muted manage-account-row-lead">
          Envoie-nous un message privé (email) avec l&apos;adresse de ton compte. Nous traitons
          ta demande sous 30 jours (droit RGPD) et te confirmons quand c&apos;est fait.
        </p>
        <a className="button-link secondary-link" href={contactHref}>
          Demander la suppression par email
        </a>
      </article>
    </div>
  );
}
