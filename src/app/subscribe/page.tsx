import Link from "next/link";
import { redirect } from "next/navigation";

import { ManageSubscriptionButton } from "@/components/billing/manage-subscription-button";
import { SubscribeButton } from "@/components/billing/subscribe-button";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { isAdminUser } from "@/lib/admin-auth";
import { resolveAdminPostAuthPath } from "@/lib/admin-profile";
import { userHasBillingAccess } from "@/lib/billing";
import {
  billingAfterTrialPriceLine,
  billingFreeCtaLabel,
  billingProCtaLabel,
  billingTrialShortLabel,
} from "@/lib/billing-offer";
import { isBillingEnforced } from "@/lib/stripe";
import { logoutToLoginAction } from "@/app/(auth)/actions";
import { getCurrentUser } from "@/lib/auth";
import { getFreshLoginPath, getFreshSignupPath } from "@/lib/auth-paths";
import { legalRoutes } from "@/lib/legal-config";

export default async function SubscribePage() {
  const user = await getCurrentUser();
  if (user && isAdminUser(user)) {
    redirect(await resolveAdminPostAuthPath(user));
  }
  const enforced = isBillingEnforced();

  const alreadyActive = user?.email ? await userHasBillingAccess(user.email) : false;
  const isUpgradeFromAccount = Boolean(user?.email && !alreadyActive);
  const isGuest = !user?.email;

  return (
    <AuthPageShell>
      <div className="card form">
        <span className="brand-chip">ABONNEMENT</span>
        <h1>{isUpgradeFromAccount ? "Passer Pro" : isGuest ? "Passer Pro" : "Accès ARTEMSI"}</h1>

        {alreadyActive ? (
          <>
            <p className="muted">Ton abonnement est actif. Tu peux ouvrir ton espace candidat.</p>
            <Link href="/dashboard" className="button-link">
              Ouvrir mon espace
            </Link>
            <ManageSubscriptionButton className="button-link secondary-link" />
          </>
        ) : isGuest ? (
          <>
            <p className="muted">
              Crée d&apos;abord ton compte gratuit pour accéder à ton espace. Tu pourras passer Pro
              depuis ton dashboard quand tu veux ({billingTrialShortLabel()},{" "}
              {billingAfterTrialPriceLine()}).
            </p>
            <Link href={getFreshSignupPath()} className="button-link">
              {billingFreeCtaLabel()}
            </Link>
            <p className="muted">
              Déjà inscrit ? <Link href={getFreshLoginPath()}>Connecte-toi</Link> pour upgrader.
            </p>
            <p className="muted">
              <Link href="/#landing-prix">Comparer Gratuit et Pro</Link>
            </p>
          </>
        ) : (
          <>
            {isUpgradeFromAccount ? (
              <p className="muted">
                Tu es connecté avec <strong>{user!.email}</strong>. Passe Pro pour débloquer le
                matching complet, les offres exclusives, les guides candidat et{" "}
                <strong>3 appels de 1 h par mois</strong> ({billingTrialShortLabel()},{" "}
                {billingAfterTrialPriceLine()}).
              </p>
            ) : (
              <p className="muted">
                Pour accéder aux offres ciblées, au suivi des candidatures et à l&apos;accompagnement,
                profite de <strong>{billingTrialShortLabel()}</strong> ({billingAfterTrialPriceLine()}
                ). Carte bancaire requise, sans débit pendant l&apos;essai. Après validation, tu
                reçois un <strong>email avec un lien</strong> pour choisir ton mot de passe (même
                adresse qu&apos;à l&apos;inscription).
              </p>
            )}

            <SubscribeButton className="button-link" email={user?.email ?? undefined}>
              {isUpgradeFromAccount ? billingProCtaLabel() : `${billingProCtaLabel()} — essai ${billingTrialShortLabel()}`}
            </SubscribeButton>

            {isUpgradeFromAccount ? (
              <>
                <Link href="/dashboard" className="button-link secondary-link">
                  Retour au dashboard
                </Link>
                <p className="muted" style={{ fontSize: "0.9rem" }}>
                  Déjà payé ? Actualise cette page dans quelques secondes.
                </p>
                <form action={logoutToLoginAction}>
                  <button type="submit" className="button-link secondary-link">
                    Utiliser un autre compte
                  </button>
                </form>
              </>
            ) : user ? (
              <>
                <p className="muted">
                  Déjà payé ? Patiente quelques secondes, puis actualise cette page.
                </p>
                <Link href="/dashboard" className="button-link secondary-link">
                  Retour au dashboard
                </Link>
                <form action={logoutToLoginAction}>
                  <button type="submit" className="button-link secondary-link">
                    Se connecter avec un autre compte
                  </button>
                </form>
                <ManageSubscriptionButton className="button-link secondary-link" />
              </>
            ) : (
              <p className="muted">
                Déjà abonné ? <Link href={getFreshLoginPath()}>Connecte-toi</Link>.
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
