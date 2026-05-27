import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { legalConfig } from "@/lib/legal-config";

export const metadata: Metadata = {
  title: "CGU & CGV — ARTEMSI",
  description:
    "Conditions générales d'utilisation et de vente de l'abonnement ARTEMSI.",
};

export default function CguPage() {
  const c = legalConfig;

  return (
    <LegalPageShell title="Conditions générales (CGU & CGV)" active="terms">
      <section>
        <h2>1. Objet</h2>
        <p>
          Les présentes conditions régissent l&apos;accès et l&apos;utilisation du service{" "}
          {c.brand}, accessible via {c.appUrl} (l&apos;&laquo;&nbsp;Application&nbsp;&raquo;),
          édité par {c.publisherName}. En créant un compte ou en souscrivant un abonnement, tu
          acceptes sans réserve ces conditions ainsi que la{" "}
          <a href="/confidentialite">politique de confidentialité</a>.
        </p>
      </section>

      <section>
        <h2>2. Description du service</h2>
        <p>
          {c.brand} est un espace candidat dédié à la recherche d&apos;alternance : offres
          ciblées, suivi des candidatures, gestion de documents (CV, lettre), réservation
          d&apos;audits CV/LM. Le service vise à réduire le bruit et structurer ta recherche ;
          il ne remplace pas ta démarche personnelle auprès des employeurs.
        </p>
      </section>

      <section>
        <h2>3. Compte utilisateur</h2>
        <ul>
          <li>Tu dois fournir des informations exactes et les maintenir à jour.</li>
          <li>
            Tu es responsable de la confidentialité de tes identifiants ; toute activité sur ton
            compte est présumée réalisée par toi.
          </li>
          <li>
            L&apos;accès peut être suspendu en cas de manquement grave (fraude, abus, atteinte au
            service ou à des tiers).
          </li>
          <li>
            Âge minimum : tu déclares avoir au moins 16 ans ou l&apos;autorisation d&apos;un
            représentant légal si la loi l&apos;exige.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Abonnement et tarifs (CGV)</h2>
        <p>
          À la date de mise à jour, la formule proposée est la suivante :
        </p>
        <ul>
          <li>
            <strong>Abonnement mensuel :</strong> 19,90&nbsp;EUR TTC / mois.
          </li>
        </ul>
        <p>
          Les prix affichés sur la landing {c.publicSiteUrl} ou au moment du paiement font foi.
          Le paiement est traité par <strong>Stripe</strong>. L&apos;abonnement est conclu pour la
          durée de la formule choisie ; sauf mention contraire, il ne se renouvelle pas
          automatiquement au-delà de la période payée (vérifie les options présentées au
          checkout Stripe).
        </p>
        <p className="muted">
          Il n&apos;est pas proposé de période d&apos;essai gratuite par défaut : l&apos;accès au
          service payant débute après validation du paiement selon le parcours en vigueur.
        </p>
      </section>

      <section>
        <h2>5. Droit de rétractation</h2>
        <p>
          Pour un contrat conclu à distance, tu disposes en principe d&apos;un délai de 14 jours
          pour te rétracter, sauf exceptions légales. Pour un service numérique fourni
          immédiatement après paiement, tu peux être invité à renoncer expressément à ce délai
          pour accéder au service sans attendre — conformément à l&apos;article L221-28 du Code
          de la consommation. Les modalités exactes sont rappelées au moment du paiement.
        </p>
      </section>

      <section>
        <h2>6. Remboursements</h2>
        <p>
          Sauf obligation légale ou décision exceptionnelle de {c.brand}, les sommes versées pour
          une période d&apos;abonnement déjà entamée ne sont pas remboursées au prorata. En cas de
          dysfonctionnement majeur imputable à {c.brand} et non résolu dans un délai raisonnable,
          contacte <a href={`mailto:${c.contactEmail}`}>{c.contactEmail}</a> pour une solution
          (extension, avoir ou remboursement selon les circonstances).
        </p>
        <p className="muted">
          Les promesses marketing sur les délais d&apos;entretien ou de résultats sont des
          moyennes ou objectifs indicatifs : ils dépendent de ton profil, du marché et de ton
          implication ; ils ne constituent pas une garantie de résultat.
        </p>
      </section>

      <section>
        <h2>7. Offres et contenus tiers</h2>
        <p>
          Certaines offres peuvent provenir de sites carrières officiels, de sources entreprises ou
          de partenaires. {c.brand} ne garantit pas la disponibilité continue d&apos;une annonce ni la
          réponse d&apos;un recruteur. Tu
          restes seul responsable des candidatures que tu envoies et des informations communiquées
          aux employeurs.
        </p>
      </section>

      <section>
        <h2>8. Propriété intellectuelle</h2>
        <p>
          Le service, sa marque et ses contenus appartiennent à {c.publisherName} ou à ses
          concédants. Tu conserves la propriété de tes documents et données ; tu accordes à{" "}
          {c.brand} une licence limitée pour les héberger et les traiter aux seules fins du
          service (matching, audit, support).
        </p>
      </section>

      <section>
        <h2>9. Responsabilité</h2>
        <p>
          {c.brand} est soumis à une obligation de moyens. En aucun cas {c.brand} ne pourra être
          tenu responsable des dommages indirects (perte d&apos;opportunité, de revenus, de
          données non sauvegardées par l&apos;utilisateur). La responsabilité totale, si elle
          est engagée, est limitée au montant des sommes payées par l&apos;utilisateur pour les
          12 derniers mois précédant le fait générateur.
        </p>
      </section>

      <section>
        <h2>10. Résiliation</h2>
        <p>
          Tu peux cesser d&apos;utiliser le service et demander la suppression de ton compte à{" "}
          <a href={`mailto:${c.contactEmail}`}>{c.contactEmail}</a>. {c.brand} peut résilier
          l&apos;accès en cas de violation des présentes conditions, avec information lorsque
          cela est possible.
        </p>
      </section>

      <section>
        <h2>11. Droit applicable et litiges</h2>
        <p>
          Les présentes conditions sont soumises au droit français. En cas de litige, une
          solution amiable sera recherchée avant toute action judiciaire. À défaut, les tribunaux
          français seront compétents, sous réserve des règles impératives de protection des
          consommateurs.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          Questions sur ces conditions :{" "}
          <a href={`mailto:${c.contactEmail}`}>{c.contactEmail}</a>.
        </p>
      </section>
    </LegalPageShell>
  );
}
