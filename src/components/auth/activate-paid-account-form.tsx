import Link from "next/link";

import { getFreshLoginPath } from "@/lib/auth-paths";

type Props = {
  initialEmail?: string;
  initialError?: string;
};

export function ActivatePaidAccountForm({ initialEmail, initialError }: Props) {
  return (
    <form className="card form" action="/api/account/activate" method="post">
      <input type="hidden" name="return_to" value="/activer-mon-compte" />
      <span className="brand-chip">ACTIVATION</span>
      <h1>Activer mon compte</h1>

      <p className="muted">
        Tu as payé ton abonnement mais l&apos;email d&apos;activation ne fonctionne pas ?
        Entre l&apos;adresse utilisée au paiement Stripe pour créer ton compte
        <strong> sans attendre l&apos;email</strong>.
      </p>

      <label htmlFor="email">Email utilisé au paiement</label>
      <input
        id="email"
        name="email"
        type="email"
        required
        defaultValue={initialEmail ?? ""}
        autoComplete="email"
      />

      {initialError ? <p className="error">{initialError}</p> : null}

      <button type="submit">Créer mon compte sans email</button>

      <p className="muted auth-form-footer" style={{ fontSize: "0.9rem" }}>
        Tu préfères recevoir un email ? Depuis la page de confirmation de paiement, utilise
        le bouton «&nbsp;Renvoyer l&apos;email&nbsp;».
        <br />
        Déjà un mot de passe ?{" "}
        <Link href={getFreshLoginPath()} className="inline-link">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
