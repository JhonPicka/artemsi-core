import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ActivatePaidAccountButton } from "@/components/billing/activate-paid-account-button";
import { ResendEmailButton } from "@/components/billing/resend-email-button";
import { getCurrentUser } from "@/lib/auth";
import {
  emailFromCheckoutSession,
  finalizePaidCheckoutSession,
  syncUserBilling,
} from "@/lib/billing";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";

type Props = {
  searchParams: Promise<{ session_id?: string; error?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id: sessionId, error: activateError } = await searchParams;
  const activationError =
    typeof activateError === "string" ? decodeURIComponent(activateError) : null;
  const currentUser = await getCurrentUser();

  let email: string | null = null;
  let needsPasswordSetup: boolean | null = null;
  let setupEmailSent = false;
  let verified = false;
  let error: string | null = null;
  let redirectToDashboard = false;

  if (!isStripeConfigured()) {
    error = "Paiement non configuré sur ce serveur.";
  } else if (!sessionId) {
    error = "Session de paiement introuvable.";
  } else {
    try {
      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription", "customer"],
      });
      const checkoutComplete =
        session.status === "complete" &&
        (session.payment_status === "paid" || session.payment_status === "no_payment_required");
      if (!checkoutComplete) {
        error = "L'inscription n'est pas encore confirmée. Réessaie dans quelques instants.";
      } else {
        email = emailFromCheckoutSession(session);
        const result = await finalizePaidCheckoutSession(session, {
          lastEventId: `success:${session.id}`,
        });
        email = result.email ?? email;
        needsPasswordSetup = result.needsPasswordSetup ?? null;
        setupEmailSent = result.setupEmailSent ?? false;
        verified = true;

        if (currentUser?.email && !needsPasswordSetup) {
          await syncUserBilling(currentUser);
          redirectToDashboard = true;
        }
      }
    } catch (cause) {
      console.error("[checkout/success]", cause);
      error =
        cause instanceof Error ? cause.message : "Impossible de vérifier le paiement.";
    }
  }

  if (redirectToDashboard) {
    redirect("/dashboard");
  }

  const loginHref = email
    ? `/login?email=${encodeURIComponent(email)}`
    : "/login";

  return (
    <AuthPageShell>
      <div className="card form">
        <span className="brand-chip">PAIEMENT</span>
        <h1>{verified ? "Essai activé" : "Vérification en cours"}</h1>

        {verified ? (
          <>
            <p className="muted">
              Merci ! Ton essai gratuit ARTEMSI est actif pour{" "}
              <strong>{email ?? "ton adresse email"}</strong>.
            </p>

            {needsPasswordSetup ? (
              <>
                <p className="muted">
                  {setupEmailSent ? (
                    <>
                      Un <strong>email avec un lien</strong> vient d&apos;être envoyé à cette
                      adresse. Clique dessus pour choisir ton mot de passe, puis complète ton
                      profil pour débloquer les offres.
                    </>
                  ) : (
                    <>
                      Ton essai est confirmé. Choisis ton mot de passe pour accéder à
                      ARTEMSI&nbsp;: renvoie l&apos;email ou crée ton compte directement
                      ci-dessous.
                    </>
                  )}
                </p>
                <p className="muted" style={{ fontSize: "0.9rem" }}>
                  Pas reçu sous 2&nbsp;min ? Vérifie tes spams, puis renvoie l&apos;email ou
                  crée ton compte directement.
                </p>
                {activationError ? <p className="error">{activationError}</p> : null}
                {email && sessionId ? (
                  <div className="checkout-success-actions">
                    <ResendEmailButton email={email} />
                    <ActivatePaidAccountButton
                      email={email}
                      returnTo={`/checkout/success?session_id=${encodeURIComponent(sessionId)}`}
                    />
                  </div>
                ) : null}
                {email ? (
                  <p className="muted auth-form-footer" style={{ fontSize: "0.9rem" }}>
                    L&apos;email ne marche toujours pas ? Tu peux aussi passer par{" "}
                    <Link
                      href={`/activer-mon-compte?email=${encodeURIComponent(email)}`}
                      className="inline-link"
                    >
                      la page d&apos;activation
                    </Link>
                    .
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <p className="muted">
                  Ton abonnement Pro est actif. Connecte-toi avec ton mot de passe habituel pour
                  retrouver ton espace.
                </p>
                <Link href={loginHref} className="button-link">
                  Se connecter
                </Link>
              </>
            )}
          </>
        ) : (
          <>
            <p className="error">{error ?? "Une erreur est survenue."}</p>
            {currentUser ? (
              <Link href="/dashboard" className="button-link">
                Retour au dashboard
              </Link>
            ) : (
              <Link href="/subscribe" className="button-link secondary-link">
                Retour à l&apos;abonnement
              </Link>
            )}
          </>
        )}
      </div>
    </AuthPageShell>
  );
}
