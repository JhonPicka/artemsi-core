import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal/legal-page-shell";
import {
  billingMonthlyPriceLine,
  billingProAuditLegalLabel,
  billingTrialShortLabel,
  BILLING_TRIAL_DAYS,
} from "@/lib/billing-offer";
import { legalConfig } from "@/lib/legal-config";

export const metadata: Metadata = {
  title: "CGU & CGV — ARTEMSI",
  description:
    "Conditions générales d'utilisation et de vente du service ARTEMSI (Gratuit et Pro).",
};

export default function CguPage() {
  const c = legalConfig;

  return (
    <LegalPageShell title="Conditions générales (CGU & CGV)" active="terms">
      <section>
        <h2>1. Objet</h2>
        <p>
          Les présentes conditions régissent l'accès et l'utilisation du service{" "}
          {c.brand}, accessible via {c.appUrl} (l'« Application »),
          édité par {c.publisherName}. En créant un compte ou en souscrivant la formule Pro, tu
          acceptes sans réserve ces conditions ainsi que la{" "}
          <a href="/confidentialite">politique de confidentialité</a>.
        </p>
      </section>

      <section>
        <h2>2. Description du service</h2>
        <p>
          {c.brand} est un espace candidat dédié à la recherche d'alternance : offres
          sélectionnées, suivi des candidatures, gestion de documents (CV, lettre de motivation) et
          accompagnement humain sur ton dossier. Le service vise à réduire le bruit et structurer ta
          recherche ; il ne remplace pas ta démarche personnelle auprès des employeurs et ne garantit
          ni un entretien ni une signature de contrat.
        </p>
        <p>Deux formules coexistent :</p>
        <ul>
          <li>
            <strong>Gratuit</strong> — inscription par e-mail, sans carte bancaire. Tu organises ta
            recherche : profil, suivi candidatures, documents, aperçu d&apos;offres matchées et
            exclusives partenaires (consultation). Le détail des limites (jobboard, matching) est
            précisé à la section 4.
          </li>
          <li>
            <strong>Pro</strong> — accès au jobboard complet, au matching selon ton profil, aux
            offres exclusives partenaires, aux guides candidat CV/LM par offre et à{" "}
            <strong>{billingProAuditLegalLabel()}</strong> avec un accompagnateur
            humain (pas de score automatique, pas d'IA générative à la place de l'échange).
          </li>
        </ul>
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
            L'accès peut être suspendu en cas de manquement grave (fraude, abus, atteinte au
            service ou à des tiers).
          </li>
          <li>
            Âge minimum : tu déclares avoir au moins 16 ans ou l'autorisation d'un
            représentant légal si la loi l'exige.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Formule Gratuite</h2>
        <p>
          La formule Gratuite permet d&apos;organiser sa recherche d&apos;alternance (profil, suivi
          candidatures, aperçu d&apos;offres). Les fonctionnalités avancées (matching complet,
          candidature aux exclusives, accompagnement humain) relèvent de la formule Pro.
        </p>
        <ul>
          <li>
            La création d'un compte gratuit ne nécessite pas de moyen de paiement.
          </li>
          <li>
            Le jobboard gratuit affiche environ <strong>50&nbsp;%</strong> des offres publiques les
            moins récentes ; les offres les plus fraîches, les offres exclusives et le matching
            complet sont réservés à la formule Pro.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Offres promotionnelles (hors socle Gratuit)</h2>
        <p>
          {c.brand} peut proposer ponctuellement des <strong>offres promotionnelles</strong>{" "}
          (ex.&nbsp;: mini-audit découverte de 10&nbsp;minutes, session collective, opération
          partenaire) selon sa disponibilité opérationnelle, sur invitation ou dans le cadre d'une
          campagne.
        </p>
        <ul>
          <li>
            Ces offres <strong>ne constituent pas un droit automatique</strong> lié à la création
            d'un compte Gratuit.
          </li>
          <li>
            Les modalités (durée, format individuel ou collectif, période d'éligibilité) sont
            précisées au moment de l'offre.
          </li>
          <li>
            Une offre promo acceptée ne remplace pas l&apos;accompagnement Pro (audit d&apos;1 heure)
            ni une relecture illimitée de documents.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Formule Pro et tarifs (CGV)</h2>
        <p>À la date de mise à jour, la formule Pro est la suivante :</p>
        <ul>
          <li>
            <strong>Essai Pro :</strong> {billingTrialShortLabel()} avec accès complet aux
            fonctionnalités Pro, lors du passage à la formule payante depuis ton compte.
          </li>
          <li>
            <strong>Abonnement mensuel :</strong> {billingMonthlyPriceLine()} après la période
            d'essai, sauf résiliation avant son terme.
          </li>
          <li>
            <strong>Accompagnement Pro :</strong> {billingProAuditLegalLabel()},
            réservables depuis l'Application (délai de réservation indiqué in-app). Un rapport
            récapitulatif peut être disponible dans ton espace après chaque échange.
          </li>
        </ul>
        <p>
          Les prix affichés sur {c.publicSiteUrl} ou au moment du paiement font foi. Le paiement et
          la gestion de l'abonnement sont traités par <strong>Stripe</strong>. L'abonnement
          Pro est conclu pour une durée d'un mois et se renouvelle tacitement chaque mois, sauf
          résiliation via le portail Stripe accessible depuis ton profil.
        </p>
        <p className="muted">
          Le passage Pro nécessite une carte bancaire valide : aucun prélèvement n'est effectué
          pendant les {BILLING_TRIAL_DAYS} jours d'essai. Sans résiliation avant la fin de
          l'essai, l'abonnement mensuel démarre automatiquement au tarif en vigueur.
        </p>
      </section>

      <section>
        <h2>7. Droit de rétractation</h2>
        <p>
          Pour un contrat conclu à distance, tu disposes en principe d'un délai de 14 jours
          pour te rétracter, sauf exceptions légales. Pour un service numérique fourni
          immédiatement après souscription Pro, tu peux être invité à renoncer expressément à ce
          délai pour accéder au service sans attendre — conformément à l'article L221-28 du
          Code de la consommation. Les modalités exactes sont rappelées au moment du paiement Stripe.
        </p>
      </section>

      <section>
        <h2>8. Remboursements</h2>
        <p>
          Sauf obligation légale ou décision exceptionnelle de {c.brand}, les sommes versées pour
          une période d'abonnement Pro déjà entamée ne sont pas remboursées au prorata. En cas
          de dysfonctionnement majeur imputable à {c.brand} et non résolu dans un délai raisonnable,
          contacte <a href={`mailto:${c.contactEmail}`}>{c.contactEmail}</a> pour une solution
          (extension, avoir ou remboursement selon les circonstances).
        </p>
        <p className="muted">
          Les indications sur les délais d'entretien, de signature ou les statistiques affichées
          sur le site sont des moyennes ou objectifs indicatifs : ils dépendent de ton profil, du
          marché et de ton implication ; ils ne constituent pas une garantie de résultat.
        </p>
      </section>

      <section>
        <h2>9. Offres et contenus tiers</h2>
        <p>
          Certaines offres peuvent provenir de sites carrières officiels, de sources entreprises ou
          de partenaires. {c.brand} ne garantit pas la disponibilité continue d'une annonce ni la
          réponse d'un recruteur. Les offres sont sélectionnées et filtrées selon ton profil ;
          leur exactitude relève aussi de ta diligence avant candidature. Tu restes seul responsable
          des candidatures que tu envoies et des informations communiquées aux employeurs.
        </p>
      </section>

      <section>
        <h2>10. Propriété intellectuelle</h2>
        <p>
          Le service, sa marque et ses contenus appartiennent à {c.publisherName} ou à ses
          concédants. Tu conserves la propriété de tes documents et données ; tu accordes à{" "}
          {c.brand} une licence limitée pour les héberger et les traiter aux seules fins du service
          (matching, accompagnement, support).
        </p>
      </section>

      <section>
        <h2>11. Responsabilité</h2>
        <p>
          {c.brand} est soumis à une obligation de moyens. En aucun cas {c.brand} ne pourra être
          tenu responsable des dommages indirects (perte d'opportunité, de revenus, de données
          non sauvegardées par l'utilisateur). La responsabilité totale, si elle est engagée,
          est limitée au montant des sommes payées par l'utilisateur pour les 12 derniers mois
          précédant le fait générateur (formule Pro uniquement).
        </p>
      </section>

      <section>
        <h2>12. Résiliation</h2>
        <p>
          Tu peux cesser d'utiliser le service à tout moment. Pour la formule Pro, tu peux
          annuler le renouvellement depuis ton profil (portail Stripe). Tu peux demander la
          suppression de ton compte à{" "}
          <a href={`mailto:${c.contactEmail}`}>{c.contactEmail}</a>. {c.brand} peut résilier
          l'accès en cas de violation des présentes conditions, avec information lorsque cela
          est possible.
        </p>
      </section>

      <section>
        <h2>13. Droit applicable et litiges</h2>
        <p>
          Les présentes conditions sont soumises au droit français. En cas de litige, une solution
          amiable sera recherchée avant toute action judiciaire. À défaut, les tribunaux français
          seront compétents, sous réserve des règles impératives de protection des consommateurs.
        </p>
      </section>

      <section>
        <h2>14. Contact</h2>
        <p>
          Questions sur ces conditions :{" "}
          <a href={`mailto:${c.contactEmail}`}>{c.contactEmail}</a>.
        </p>
      </section>
    </LegalPageShell>
  );
}
