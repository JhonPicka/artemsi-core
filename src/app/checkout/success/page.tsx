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
    error = "Stripe non configure sur ce serveur.";
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
        error = "Le paiement n'est pas encore confirme. Reessaie dans quelques instants.";
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
          : "Impossible de verifier la session Stripe.";
    }
  }

  const signupHref = email ? `/signup?email=${encodeURIComponent(email)}` : "/signup";
  const loginHref = email ? `/login?email=${encodeURIComponent(email)}` : "/login";

  return (
    <AuthPageShell>
      <div className="card form">
        <span className="brand-chip">PAIEMENT</span>
        <h1>{verified ? "Paiement confirme" : "Verification en cours"}</h1>

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
              Tu vas recevoir un email avec un lien de confirmation (envoi automatique apres
              paiement). Clique dessus : ton email sera pre-rempli et tu choisiras ton mot de passe.
            </p>
            <p className="muted" style={{ fontSize: "0.9rem" }}>
              Pas recu sous 2 min ? Verifie les spams ou utilise le secours ci-dessous (meme adresse
              Stripe).
            </p>
            <Link href={signupHref} className="button-link secondary-link">
              Choisir mon mot de passe (sans email)
            </Link>
            <Link href={loginHref} className="button-link secondary-link">
              J&apos;ai deja un compte
            </Link>
          </>
        ) : (
          <>
            <p className="error">{error ?? "Une erreur est survenue."}</p>
            <Link href="/subscribe" className="button-link secondary-link">
              Retour a l&apos;abonnement
            </Link>
          </>
        )}
      </div>
    </AuthPageShell>
  );
}
