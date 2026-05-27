import Link from "next/link";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SubscribeButton } from "@/components/billing/subscribe-button";

export default function CheckoutCancelPage() {
  return (
    <AuthPageShell>
      <div className="card form">
        <span className="brand-chip">PAIEMENT</span>
        <h1>Paiement annule</h1>
        <p className="muted">
          Tu n&apos;as pas ete debite. Tu peux reprendre quand tu veux — 19,90&nbsp;EUR TTC / mois.
        </p>
        <SubscribeButton className="button-link">Reprendre l&apos;abonnement</SubscribeButton>
        <Link href="/" className="button-link secondary-link">
          Retour a l&apos;accueil
        </Link>
      </div>
    </AuthPageShell>
  );
}
