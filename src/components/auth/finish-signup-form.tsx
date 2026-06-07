import Link from "next/link";

import { getFreshLoginPath } from "@/lib/auth-paths";
import { legalRoutes } from "@/lib/legal-config";

type Props = {
  email: string;
  initialError?: string;
};

export function FinishSignupForm({ email, initialError }: Props) {
  return (
    <form className="card form" action="/api/account/finish-signup" method="post">
      <span className="brand-chip">ACTIVATION</span>
      <h1>Choisis ton mot de passe</h1>
      <p className="muted">
        Dernière étape : choisis le mot de passe de ton espace ARTEMSI. Tu pourras ensuite compléter
        ton profil et accéder aux offres.
      </p>

      <p className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>
        Email de ton compte : <strong>{email}</strong>
      </p>

      <label htmlFor="password">Mot de passe</label>
      <input id="password" name="password" type="password" required autoComplete="new-password" />

      <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
      <input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        required
        autoComplete="new-password"
      />

      <label className="legal-consent">
        <input type="checkbox" name="acceptLegal" value="on" required />
        <span>
          J&apos;accepte les{" "}
          <Link href={legalRoutes.terms} target="_blank" rel="noopener noreferrer">
            CGU & CGV
          </Link>{" "}
          et la{" "}
          <Link href={legalRoutes.privacy} target="_blank" rel="noopener noreferrer">
            politique de confidentialité
          </Link>
          .
        </span>
      </label>

      {initialError ? <p className="error">{initialError}</p> : null}

      <button type="submit">Activer mon compte</button>

      <p className="muted auth-form-footer">
        Problème de session ?{" "}
        <Link href="/activer-mon-compte" className="inline-link">
          Réactiver mon compte
        </Link>
        {" · "}
        <Link href={getFreshLoginPath()} className="inline-link">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
