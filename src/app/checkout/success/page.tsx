import Link from "next/link";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { activateBillingFromCheckoutSession } from "@/lib/billing";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;

  let email: string | null = null;
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
        await activateBillingFromCheckoutSession(session);
        verified = true;
        const details = session.customer_details;
        email =
          (details?.email ?? session.customer_email ?? null)?.toLowerCase() ?? null;
      }
    } catch (cause) {
      console.error("[checkout/success]", cause);
      error =
        cause instanceof Error
          ? cause.message
          : "Impossible de vérifier le paiement.";
    }
  }

  const signupHref = email ? `/signup?email=${encodeURIComponent(email)}` : "/signup";
  const loginHref = email ? `/login?email=${encodeURIComponent(email)}` : "/login";

  return (
    <AuthPageShell>
      <div className="card form">
        <span className="brand-chip">PAIEMENT</span>
        <h1>{verified ? "Paiement confirmé" : "Vérification en cours"}</h1>

        {verified ? (
          <>
            <p className="muted">
              Merci ! Ton abonnement ARTEMSI est actif
              {email ? (
                <>
                  {" "}
                  pour <strong>{email}</strong>
                </>
              ) : null}
              .
            </p>
            <p className="muted">
              Tu vas recevoir un <strong>email avec un lien</strong> sur l&apos;adresse utilisée au
              paiement. Clique dessus pour choisir ton mot de passe, puis complète ton profil pour
              débloquer les offres.
            </p>
            <p className="muted" style={{ fontSize: "0.9rem" }}>
              Pas reçu sous 2&nbsp;min ? Vérifie tes spams ou crée ton mot de passe ci-dessous (même
              email qu&apos;au paiement).
            </p>
            <Link href={signupHref} className="button-link secondary-link">
              Créer mon mot de passe
            </Link>
            <Link href={loginHref} className="button-link secondary-link">
              J&apos;ai déjà un compte
            </Link>
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
