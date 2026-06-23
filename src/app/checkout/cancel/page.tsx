import Link from "next/link";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SubscribeButton } from "@/components/billing/subscribe-button";
import { billingProCtaLabel } from "@/lib/billing-offer";
import { getCurrentUser } from "@/lib/auth";

export default async function CheckoutCancelPage() {
  const user = await getCurrentUser();

  return (
    <AuthPageShell>
      <div className="card form">
        <span className="brand-chip">PAIEMENT</span>
        <h1>Paiement annulé</h1>
        <p className="muted">
          Tu n&apos;as pas été débité. Reprends quand tu veux.
        </p>
        <SubscribeButton className="button-link" email={user?.email ?? undefined}>
          {billingProCtaLabel()}
        </SubscribeButton>
        {user ? (
          <Link href="/dashboard" className="button-link secondary-link">
            Retour au dashboard
          </Link>
        ) : (
          <Link href="/" className="button-link secondary-link">
            Retour à l&apos;accueil
          </Link>
        )}
      </div>
    </AuthPageShell>
  );
}
