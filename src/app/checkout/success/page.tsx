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
              Etape suivante : recois un lien de connexion avec{" "}
              <strong>exactement le meme email</strong> que sur Stripe.
            </p>
            <Link href={loginHref} className="button-link">
              M&apos;envoyer le lien de connexion
            </Link>
            <Link href="/login" className="button-link secondary-link">
              Renvoyer un lien
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
