import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { legalConfig } from "@/lib/legal-config";

export const metadata: Metadata = {
  title: "Politique de confidentialité — ARTEMSI",
  description:
    "Comment ARTEMSI collecte, utilise et protège tes données personnelles (RGPD).",
};

export default function ConfidentialitePage() {
  const c = legalConfig;

  return (
    <LegalPageShell title="Politique de confidentialité" active="privacy">
      <section>
        <h2>1. Responsable du traitement</h2>
        <p>
          <strong>{c.publisherName}</strong> — {c.legalForm}
          <br />
          {c.registeredAddress}
          <br />
          Contact données personnelles :{" "}
          <a href={`mailto:${c.contactEmail}`}>{c.contactEmail}</a>
        </p>
      </section>

      <section>
        <h2>2. Données collectées</h2>
        <p>
          Selon ton utilisation du service (formule Gratuite ou Pro), nous pouvons traiter :
        </p>
        <ul>
          <li>
            <strong>Compte :</strong> adresse e-mail, mot de passe (hashé côté Supabase Auth),
            identifiant utilisateur, formule souscrite (Gratuit ou Pro).
          </li>
          <li>
            <strong>Profil candidat :</strong> nom, téléphone, établissement, niveau d'études,
            domaine, poste visé, zones géographiques, dates et préférences de contrat.
          </li>
          <li>
            <strong>Documents :</strong> CV et lettre de motivation (fichiers PDF ou Word) stockés
            de manière privée.
          </li>
          <li>
            <strong>Candidatures :</strong> offres suivies, statuts, notes que tu saisis.
          </li>
          <li>
            <strong>Matching et offres :</strong> historique des offres consultées, assignées ou
            mises de côté selon ton profil.
          </li>
          <li>
            <strong>Accompagnement :</strong> créneaux réservés (appels Pro), offres promotionnelles
            ponctuelles le cas échéant, échanges liés à ta demande, rapports rédigés disponibles dans
            ton espace.
          </li>
          <li>
            <strong>Paiement (Pro uniquement) :</strong> données gérées par Stripe (nous ne stockons
            pas ton numéro de carte sur nos serveurs).
          </li>
          <li>
            <strong>Technique :</strong> logs de connexion, cookies de session nécessaires au
            fonctionnement de l'application.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Finalités et bases légales</h2>
        <table className="legal-table">
          <thead>
            <tr>
              <th scope="col">Finalité</th>
              <th scope="col">Base légale (RGPD)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Création et gestion de ton compte (Gratuit ou Pro)</td>
              <td>Exécution du contrat (CGU)</td>
            </tr>
            <tr>
              <td>Matching et proposition d'offres pertinentes</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Suivi des candidatures et notifications</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Accompagnement humain (audit, appels Pro) et support</td>
              <td>Exécution du contrat / intérêt légitime</td>
            </tr>
            <tr>
              <td>Facturation et gestion de l'abonnement Pro</td>
              <td>Exécution du contrat / obligation légale</td>
            </tr>
            <tr>
              <td>Amélioration du service et sécurité</td>
              <td>Intérêt légitime</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>4. Durées de conservation</h2>
        <ul>
          <li>
            <strong>Compte actif :</strong> données conservées tant que tu utilises le service ou
            que ton abonnement Pro est actif.
          </li>
          <li>
            <strong>Compte Gratuit inactif :</strong> suppression ou anonymisation après une
            période d'inactivité prolongée, avec information préalable lorsque c'est
            possible.
          </li>
          <li>
            <strong>Après résiliation Pro ou suppression de compte :</strong> suppression ou
            anonymisation dans un délai raisonnable (sauf obligations légales de conservation,
            ex. facturation).
          </li>
          <li>
            <strong>Documents :</strong> conservés tant qu'ils restent actifs sur ton profil ;
            remplacement possible à tout moment.
          </li>
          <li>
            <strong>Rapports d'accompagnement :</strong> conservés dans ton espace tant que
            ton compte est actif, sauf demande de suppression de ta part.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Destinataires et sous-traitants</h2>
        <p>Tes données peuvent être traitées par :</p>
        <ul>
          <li>
            <strong>Supabase</strong> — authentification, base de données, stockage des fichiers
            (hébergement selon région du projet).
          </li>
          <li>
            <strong>Stripe</strong> — paiement et gestion de l'abonnement Pro.
          </li>
          <li>
            <strong>Resend</strong> (si activé) — envoi d'e-mails transactionnels
            (accompagnement, notifications).
          </li>
          <li>
            <strong>Hébergeur de l'application</strong> — {c.hostName}.
          </li>
        </ul>
        <p>
          Ces prestataires agissent en tant que sous-traitants au sens du RGPD, dans le cadre de
          contrats ou conditions imposant des garanties de sécurité et de confidentialité.
        </p>
      </section>

      <section>
        <h2>6. Transferts hors UE</h2>
        <p>
          Lorsque un sous-traitant traite des données hors Union européenne, nous nous appuyons
          sur les mécanismes prévus par le RGPD (clauses contractuelles types, décisions
          d'adéquation) selon les outils proposés par le prestataire.
        </p>
      </section>

      <section>
        <h2>7. Tes droits</h2>
        <p>Conformément au RGPD, tu disposes des droits suivants :</p>
        <ul>
          <li>accès, rectification, effacement ;</li>
          <li>limitation du traitement, opposition (selon les cas) ;</li>
          <li>portabilité des données fournies ;</li>
          <li>retrait du consentement lorsque le traitement est fondé sur le consentement ;</li>
          <li>
            introduction d'une réclamation auprès de la CNIL (
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
              www.cnil.fr
            </a>
            ).
          </li>
        </ul>
        <p>
          Pour demander la suppression de ton compte : envoie un e-mail à{" "}
          <a href={`mailto:${c.contactEmail}`}>{c.contactEmail}</a> depuis l'adresse liée à
          ton compte (objet « suppression de compte »). Nous traitons la demande sous 30 jours.
        </p>
        <p>
          Pour exercer tes autres droits :{" "}
          <a href={`mailto:${c.contactEmail}`}>{c.contactEmail}</a>. Nous répondrons dans les
          délais prévus par la réglementation.
        </p>
      </section>

      <section>
        <h2>8. Sécurité</h2>
        <p>
          Nous appliquons des mesures techniques et organisationnelles adaptées : accès
          authentifié, stockage des documents en bucket privé, URLs signées à durée limitée,
          politiques d'accès par utilisateur (RLS) côté base de données.
        </p>
      </section>

      <section>
        <h2>9. Cookies</h2>
        <p>
          L'application utilise des cookies strictement nécessaires à la session
          (authentification). Si des cookies de mesure d'audience ou marketing sont ajoutés
          ultérieurement, une information et un choix te seront proposés avant leur dépôt.
        </p>
      </section>

      <section>
        <h2>10. Modifications</h2>
        <p>
          Cette politique peut être mise à jour. La date en tête de page indique la dernière
          révision. En cas de changement substantiel, nous t'en informerons par un moyen
          approprié (e-mail ou notification in-app).
        </p>
      </section>
    </LegalPageShell>
  );
}
