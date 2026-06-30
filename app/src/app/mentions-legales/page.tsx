import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { legalConfig } from "@/lib/legal-config";

export const metadata: Metadata = {
  title: "Mentions légales — ARTEMSI",
  description: "Mentions légales du site et de l'application ARTEMSI.",
};

export default function MentionsLegalesPage() {
  const c = legalConfig;

  return (
    <LegalPageShell title="Mentions légales" active="mentions">
      <section>
        <h2>1. Éditeur du site</h2>
        <p>
          Le site {c.publicSiteUrl} et l'application candidat accessible à {c.appUrl}{" "}
          sont édités par :
        </p>
        <ul>
          <li>
            <strong>Dénomination :</strong> {c.publisherName}
          </li>
          <li>
            <strong>Forme juridique :</strong> {c.legalForm}
          </li>
          <li>
            <strong>{c.companyIdLabel} :</strong> {c.companyId}
          </li>
          <li>
            <strong>Siège / adresse :</strong> {c.registeredAddress}
          </li>
          <li>
            <strong>Contact :</strong>{" "}
            <a href={`mailto:${c.contactEmail}`}>{c.contactEmail}</a>
          </li>
        </ul>
        <p className="muted">
          {c.brand} propose un service en ligne d'aide à la recherche d'alternance :
          formule Gratuite (jobboard partiel, suivi, profil) et formule Pro payante (matching
          complet, offres exclusives, accompagnement humain).
        </p>
      </section>

      <section>
        <h2>2. Directeur de la publication</h2>
        <p>{c.publicationDirector}</p>
      </section>

      <section>
        <h2>3. Hébergement</h2>
        <p>L'application et les données associées sont hébergées par :</p>
        <ul>
          <li>
            <strong>Hébergeur :</strong> {c.hostName}
          </li>
          <li>
            <strong>Adresse :</strong> {c.hostAddress}
          </li>
        </ul>
        <p className="muted">
          Les données utilisateur (comptes, profils, documents) sont également traitées via la
          plateforme Supabase (base de données et stockage fichiers), dont les serveurs peuvent
          être situés dans l'Union européenne selon la configuration du projet. Les paiements
          de la formule Pro sont traités par Stripe.
        </p>
      </section>

      <section>
        <h2>4. Propriété intellectuelle</h2>
        <p>
          L'ensemble des éléments du site et de l'application (textes, graphismes, logo,
          structure, logiciels) est protégé par le droit de la propriété intellectuelle. Toute
          reproduction ou représentation non autorisée est interdite.
        </p>
      </section>

      <section>
        <h2>5. Limitation de responsabilité</h2>
        <p>
          {c.brand} met en œuvre des moyens raisonnables pour assurer l'accès au service et
          la fiabilité des informations. Le service est fourni en l'état ; {c.brand} ne
          garantit pas l'obtention d'un contrat, d'une alternance ou d'un entretien. Les offres publiées peuvent provenir de sources tierces ; leur exactitude
          relève de la diligence de l'utilisateur avant candidature. Les statistiques ou
          délais évoqués sur le site sont indicatifs et ne constituent pas une promesse de
          résultat.
        </p>
      </section>

      <section>
        <h2>6. Liens utiles</h2>
        <p>
          Pour le traitement des données personnelles, consulte la{" "}
          <a href="/confidentialite">politique de confidentialité</a>. Pour les conditions
          d'utilisation et de vente (formules Gratuite et Pro), consulte les{" "}
          <a href="/cgu">CGU & CGV</a>.
        </p>
      </section>
    </LegalPageShell>
  );
}
