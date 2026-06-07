import Link from "next/link";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ActivatePaidAccountButton } from "@/components/billing/activate-paid-account-button";
import { ResendEmailButton } from "@/components/billing/resend-email-button";
import { emailFromCheckoutSession, finalizePaidCheckoutSession } from "@/lib/billing";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;

  let email: string | null = null;
  let needsPasswordSetup: boolean | null = null;
  let setupEmailSent = false;
  let verified = false;
  let error: string | null = null;

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
      const paid = session.payment_status === "paid" || session.status === "complete";
      if (!paid) {
        error = "Le paiement n'est pas encore confirmé. Réessaie dans quelques instants.";
      } else {
        email = emailFromCheckoutSession(session);
        const result = await finalizePaidCheckoutSession(session, {
          lastEventId: `success:${session.id}`,
        });
        email = result.email ?? email;
        needsPasswordSetup = result.needsPasswordSetup ?? null;
        setupEmailSent = result.setupEmailSent ?? false;
        verified = true;
      }
    } catch (cause) {
      console.error("[checkout/success]", cause);
      error =
        cause instanceof Error ? cause.message : "Impossible de vérifier le paiement.";
    }
  }

  return (
    <AuthPageShell>
      <div className="card form">
        <span className="brand-chip">PAIEMENT</span>
        <h1>{verified ? "Paiement confirmé" : "Vérification en cours"}</h1>

        {verified ? (
          <>
            <p className="muted">
              Merci ! Ton abonnement ARTEMSI est actif pour{" "}
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
                      Ton paiement est actif, mais l&apos;email d&apos;activation n&apos;a pas pu
                      partir automatiquement. Utilise le bouton ci-dessous pour recevoir le lien.
                    </>
                  )}
                </p>
                <p className="muted" style={{ fontSize: "0.9rem" }}>
                  Pas reçu sous 2&nbsp;min ? Vérifie tes spams, puis renvoie l&apos;email ou
                  crée ton compte directement.
                </p>
                {email ? (
                  <div className="checkout-success-actions">
                    <ResendEmailButton email={email} />
                    <ActivatePaidAccountButton email={email} />
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
                  Tu as déjà un compte ARTEMSI. Connecte-toi directement avec ton mot de
                  passe habituel.
                </p>
                <Link href="/login" className="button-link">
                  Se connecter
                </Link>
              </>
            )}
          </>
        ) : (
          <>
            <p className="error">{error ?? "Une erreur est survenue."}</p>
            <Link href="/subscribe" className="button-link secondary-link">
              Retour à l&apos;abonnement
            </Link>
          </>
        )}
      </div>
    </AuthPageShell>
  );
}
