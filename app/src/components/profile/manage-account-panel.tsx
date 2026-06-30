"use client";

import Link from "next/link";

import { SubscribeButton } from "@/components/billing/subscribe-button";
import { ManageSubscriptionButton } from "@/components/billing/manage-subscription-button";
import {
  billingProTrialLine,
  billingUpgradeCtaLabel,
} from "@/lib/billing-offer";
import { legalConfig } from "@/lib/legal-config";

type Props = {
  isPro: boolean;
};

export function ManageAccountPanel({ isPro }: Props) {
  const contactSubject = encodeURIComponent("Demande de suppression de compte ARTEMSI");
  const contactHref = `mailto:${legalConfig.contactEmail}?subject=${contactSubject}`;

  return (
    <div className="manage-account-panel">
      <article
        className={`manage-account-row${!isPro ? " manage-account-row--upgrade" : ""}`}
      >
        <div className="manage-account-row-head">
          {!isPro ? <span className="brand-chip manage-account-row-chip">PRO</span> : null}
          <p className="manage-account-row-title">
            {isPro ? "Gérer mon abonnement" : "Upgrade Pro"}
          </p>
        </div>
        {isPro ? (
          <>
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
          </>
        ) : (
          <>
            <p className="muted manage-account-row-lead">
              Débloque le <strong>matching complet</strong> sur ton profil, le jobboard intégral,
              les offres partenaires et l&apos;audit CV.
            </p>
            <p className="manage-account-row-trial">{billingProTrialLine()}</p>
            <div className="manage-account-upgrade-actions">
              <SubscribeButton className="button-link manage-account-upgrade-cta">
                {billingUpgradeCtaLabel()}
              </SubscribeButton>
              <Link href="/subscribe" className="button-link secondary-link">
                Voir les détails
              </Link>
            </div>
          </>
        )}
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
