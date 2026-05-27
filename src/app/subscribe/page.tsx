import Link from "next/link";
import { redirect } from "next/navigation";

import { ManageSubscriptionButton } from "@/components/billing/manage-subscription-button";
import { SubscribeButton } from "@/components/billing/subscribe-button";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { getAdminHomePath, isAdminEmail } from "@/lib/admin-auth";
import { userHasBillingAccess } from "@/lib/billing";
import { isBillingEnforced } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { legalRoutes } from "@/lib/legal-config";

export default async function SubscribePage() {
  const user = await getCurrentUser();
  if (user?.email && isAdminEmail(user.email)) {
    redirect(getAdminHomePath());
  }
  const enforced = isBillingEnforced();

  const alreadyActive = user?.email ? await userHasBillingAccess(user.email) : false;

  return (
    <AuthPageShell>
      <div className="card form">
        <span className="brand-chip">ABONNEMENT</span>
        <h1>Acces ARTEMSI</h1>

        {alreadyActive ? (
          <>
            <p className="muted">Ton abonnement est actif. Tu peux acceder a ton espace.</p>
            <Link href="/dashboard" className="button-link">
              Ouvrir le dashboard
            </Link>
            <ManageSubscriptionButton className="button-link secondary-link" />
          </>
        ) : (
          <>
            <p className="muted">
              L&apos;espace candidat est reserve aux abonnes. Souscris a{" "}
              <strong>19,90&nbsp;EUR TTC / mois</strong> (paiement securise Stripe), puis cree ton
              compte avec <strong>le meme email</strong> que lors du paiement.
            </p>

            <SubscribeButton className="button-link">S&apos;abonner — 19,90&nbsp;EUR / mois</SubscribeButton>

            {user ? (
              <>
                <p className="muted">
                  Deja paye ? Attends quelques secondes que le paiement soit confirme, puis
                  rafraichis cette page.
                </p>
                <ManageSubscriptionButton className="button-link secondary-link" />
              </>
            ) : (
              <p className="muted">
                Deja abonne ?{" "}
                <Link href="/login">Connecte-toi</Link> ou{" "}
                <Link href="/signup">cree ton compte</Link> avec l&apos;email utilise au paiement.
              </p>
            )}

            <p className="muted">
              <Link href={legalRoutes.terms}>CGU & CGV</Link>
              {" · "}
              <Link href={legalRoutes.privacy}>Confidentialite</Link>
            </p>
          </>
        )}

        {!enforced ? (
          <p className="muted">
            Configuration Stripe incomplete. En local :{" "}
            <a href="/api/stripe/status" target="_blank" rel="noreferrer">
              diagnostic
            </a>
            {" · "}
            <a
              href="https://dashboard.stripe.com/test/apikeys"
              target="_blank"
              rel="noopener noreferrer"
            >
              creer une cle sk_test_
            </a>
            {" · "}
            voir <code>docs/STRIPE_SETUP.md</code>
          </p>
        ) : null}
      </div>
    </AuthPageShell>
  );
}
