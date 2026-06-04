import Link from "next/link";
import { redirect } from "next/navigation";

import { ManageSubscriptionButton } from "@/components/billing/manage-subscription-button";
import { SubscribeButton } from "@/components/billing/subscribe-button";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { getAdminHomePath, isAdminUser } from "@/lib/admin-auth";
import { userHasBillingAccess } from "@/lib/billing";
import { isBillingEnforced } from "@/lib/stripe";
import { logoutToLoginAction } from "@/app/(auth)/actions";
import { getCurrentUser } from "@/lib/auth";
import { legalRoutes } from "@/lib/legal-config";

export default async function SubscribePage() {
  const user = await getCurrentUser();
  if (isAdminUser(user)) {
    redirect(getAdminHomePath());
  }
  const enforced = isBillingEnforced();

  const alreadyActive = user?.email ? await userHasBillingAccess(user.email) : false;

  return (
    <AuthPageShell>
      <div className="card form">
        <span className="brand-chip">ABONNEMENT</span>
        <h1>Accès ARTEMSI</h1>

        {alreadyActive ? (
          <>
            <p className="muted">Ton abonnement est actif. Tu peux ouvrir ton espace candidat.</p>
            <Link href="/dashboard" className="button-link">
              Ouvrir mon espace
            </Link>
            <ManageSubscriptionButton className="button-link secondary-link" />
          </>
        ) : (
          <>
            <p className="muted">
              Pour accéder aux offres ciblées, au suivi des candidatures et à l&apos;accompagnement,
              souscris à <strong>19,90&nbsp;EUR TTC / mois</strong>. Paiement sécurisé. Après
              validation, tu reçois un <strong>email avec un lien</strong> pour choisir ton mot de
              passe (même adresse qu&apos;au paiement).
            </p>

            <SubscribeButton className="button-link">
              S&apos;abonner — 19,90&nbsp;EUR / mois
            </SubscribeButton>

            {user ? (
              <>
                <p className="muted">
                  Déjà payé ? Patiente quelques secondes, puis actualise cette page.
                </p>
                <form action={logoutToLoginAction}>
                  <button type="submit" className="button-link secondary-link">
                    Se connecter avec un autre compte
                  </button>
                </form>
                <ManageSubscriptionButton className="button-link secondary-link" />
              </>
            ) : (
              <p className="muted">
                Déjà abonné ? <Link href="/login">Connecte-toi</Link>. Pas encore de mot de passe ?{" "}
                <Link href="/signup">Crée-le ici</Link> avec le même email qu&apos;au paiement.
              </p>
            )}

            <p className="muted">
              <Link href={legalRoutes.terms}>CGU & CGV</Link>
              {" · "}
              <Link href={legalRoutes.privacy}>Confidentialité</Link>
            </p>
          </>
        )}

        {!enforced ? (
          <p className="muted">
            Configuration Stripe incomplète. En local :{" "}
            <a href="/api/stripe/status" target="_blank" rel="noreferrer">
              diagnostic
            </a>
            {" · "}
            <a
              href="https://dashboard.stripe.com/test/apikeys"
              target="_blank"
              rel="noopener noreferrer"
            >
              créer une clé sk_test_
            </a>
            {" · "}
            voir <code>docs/STRIPE_SETUP.md</code>
          </p>
        ) : null}
      </div>
    </AuthPageShell>
  );
}
