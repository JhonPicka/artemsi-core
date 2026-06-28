import {
  billingFreeVsProFaqSummary,
  billingMonthlyPriceLine,
  billingTrialShortLabel,
  BILLING_TRIAL_DAYS,
} from "@/lib/billing-offer";
import { legalConfig } from "@/lib/legal-config";

export type LandingFaqEntry = {
  id: string;
  question: string;
  answerText: string;
  category: "recherche" | "documents-entretien" | "artemsi";
};

export const FAQ_CATEGORIES: Record<LandingFaqEntry["category"], string> = {
  recherche: "Recherche d'alternance",
  "documents-entretien": "CV, lettre de motivation et entretien",
  artemsi: "ARTEMSI — la plateforme",
};

/** 18 entrées FAQ — couvre les requêtes informationelles + produit pour un SEO maximal. */
export function getLandingFaqEntries(): LandingFaqEntry[] {
  const { free, pro } = billingFreeVsProFaqSummary();
  const brand = legalConfig.brand;
  const site = legalConfig.publicSiteLabel;

  return [
    // ── Catégorie 1 : Recherche d'alternance ─────────────────────────────────
    {
      id: "quand-commencer",
      category: "recherche",
      question: "Quand commencer à chercher une alternance ingénieur ?",
      answerText:
        "Il est conseillé de démarrer la recherche 4 à 6 mois avant le début du contrat. Pour une rentrée en septembre, commence dès mars-avril. Les grandes entreprises ouvrent leurs offres dès janvier-février ; les PME et ETI recrutent souvent en continu jusqu'à juillet-août. Plus tu commences tôt, plus tu as le choix. Sur ARTEMSI, tu peux compléter ton profil (métier, région, école) dès maintenant pour recevoir des offres matchées dès qu'elles sont disponibles — même si ta rentrée n'est qu'en septembre.",
    },
    {
      id: "combien-candidatures",
      category: "recherche",
      question: "Combien de candidatures faut-il envoyer pour décrocher une alternance ?",
      answerText:
        "Envoyer 80 à 150 candidatures identiques est généralement moins efficace que 15 à 30 candidatures très ciblées et personnalisées. Les recruteurs voient immédiatement les lettres copiées-collées. La clé : un CV et une lettre adaptés à chaque offre et chaque entreprise, une relance à J+14 si pas de réponse, et un suivi actif de chaque candidature. ARTEMSI te propose des offres matchées sur ton profil et, en Pro, un guide candidat CV/LM adapté à chaque offre pour maximiser chaque candidature.",
    },
    {
      id: "apprentissage-vs-pro",
      category: "recherche",
      question:
        "Contrat d'apprentissage ou contrat de professionnalisation : quelle différence ?",
      answerText:
        "Le contrat d'apprentissage s'adresse aux 16–29 ans inscrits dans un établissement de formation (école d'ingénieurs, BTS, BUT, master). Il est financé en partie par la taxe d'apprentissage et ouvre droit à une aide pour les entreprises de moins de 250 salariés. Le contrat de professionnalisation est plus ouvert (pas de limite d'âge strict, reconversion possible) mais moins utilisé dans les écoles d'ingénieurs. Pour la grande majorité des étudiants en alternance ingénierie ou industrie, c'est le contrat d'apprentissage qui s'applique.",
    },
    {
      id: "salaire-alternance",
      category: "recherche",
      question: "Quel est le salaire d'un alternant ingénieur en 2025-2026 ?",
      answerText:
        "Le salaire minimum légal d'un alternant en apprentissage est calculé en pourcentage du SMIC selon l'âge et l'année de contrat. En 2025-2026 : 21 ans, 2e année → environ 67 % du SMIC, soit ~1 180 € brut/mois. Dans les grandes entreprises du secteur industrie, tech ou énergie, la rémunération peut dépasser 1 400 à 2 000 € brut/mois. Les PME respectent souvent le minimum légal. Le salaire exact est toujours négociable au moment de la signature du contrat avec l'employeur.",
    },
    {
      id: "sans-experience",
      category: "recherche",
      question: "Comment trouver une alternance quand on n'a pas d'expérience ?",
      answerText:
        "La grande majorité des entreprises qui recrutent en alternance savent qu'elles s'adressent à des étudiants sans expérience professionnelle significative. Tes atouts : un profil clair (domaine, région, compétences techniques de ta formation), des projets école ou personnels valorisés sur ton CV, et une lettre de motivation qui explique ta motivation réelle pour l'entreprise et le secteur — pas une lettre générique. ARTEMSI t'aide à structurer ton profil et, en Pro, propose des guides CV/LM adaptés à chaque offre pour maximiser chaque candidature.",
    },
    {
      id: "delai-trouver",
      category: "recherche",
      question: "Combien de temps faut-il pour trouver une alternance ?",
      answerText:
        "Le délai varie selon le secteur, la région et la période. En ingénierie et industrie, certains étudiants décrochent une alternance en 2 à 4 semaines avec un profil ciblé et des candidatures personnalisées. Pour d'autres, la recherche dure 2 à 4 mois. Le calendrier joue beaucoup : les offres sont plus nombreuses de mars à juillet pour une rentrée en septembre. Les trois leviers principaux : commencer tôt, cibler des offres adaptées à ton profil (pas de candidature au hasard) et relancer systématiquement à J+14.",
    },
    {
      id: "erreurs-recherche",
      category: "recherche",
      question: "Quelles sont les principales erreurs dans une recherche d'alternance ?",
      answerText:
        "Les erreurs les plus fréquentes : candidatures identiques envoyées en masse sans personnalisation, absence de relance après 2 semaines sans réponse, CV avec des fautes ou un format illisible (photo non professionnelle, trop long), ciblage incohérent avec sa formation, et démarrage trop tardif (après juin pour une rentrée en septembre). ARTEMSI réduit ces risques avec le suivi centralisé de tes candidatures, les guides par offre (Pro) et l'accompagnement humain pour corriger ce qui bloque.",
    },

    // ── Catégorie 2 : CV, lettre de motivation, entretien ────────────────────
    {
      id: "cv-alternance",
      category: "documents-entretien",
      question: "Comment faire un bon CV pour une alternance ingénieur ?",
      answerText:
        "Un bon CV alternance ingénieur : une page maximum, compétences techniques en avant (langages, logiciels, machines, méthodes), projets école détaillés avec résultats concrets, stages même courts mentionnés, formation + école + niveau clairement indiqués, type de contrat et date de disponibilité précisés. Évite les formulations creuses (« autonome, rigoureux, motivé »), les photos non professionnelles et les gros blocs de texte. En Pro sur ARTEMSI, un guide CV adapté à chaque offre t'indique précisément ce que l'entreprise recherche.",
    },
    {
      id: "lettre-motivation",
      category: "documents-entretien",
      question: "Comment rédiger une lettre de motivation pour une alternance ?",
      answerText:
        "Structure en 3 parties : pourquoi cette entreprise (activité, valeurs, projets — montre que tu t'es renseigné), pourquoi ce poste correspond à ta formation et tes objectifs, et ce que tu apportes concrètement (compétences, projets école, motivation sectorielle). Une page maximum, ton ton direct et sincère, et surtout zéro copier-coller — les recruteurs les voient instantanément. En Pro sur ARTEMSI, chaque offre inclut un guide lettre de motivation personnalisé pour construire un argumentaire convaincant.",
    },
    {
      id: "entretien-alternance",
      category: "documents-entretien",
      question: "Comment préparer un entretien d'alternance ?",
      answerText:
        "Prépare-toi sur 4 axes : (1) connaissance de l'entreprise (activité, concurrents, actualités récentes) ; (2) maîtrise de ton CV et de tes projets (savoir expliquer chaque ligne concrètement) ; (3) réponses aux questions classiques (« pourquoi nous ? », « tes forces et faiblesses ? », « où tu te vois dans 5 ans ? ») ; (4) questions à poser au recruteur (missions précises, encadrement, équipe, évolution possible). Les abonnés Pro ARTEMSI bénéficient de 3 appels d'une heure par mois, dont une préparation entretien personnalisée avec un accompagnateur humain.",
    },
    {
      id: "relancer-recruteur",
      category: "documents-entretien",
      question: "Comment relancer un recruteur après une candidature alternance ?",
      answerText:
        "Relance par email ou LinkedIn entre J+10 et J+14 si tu n'as pas eu de réponse. Formule brève et professionnelle : rappelle ton nom, le poste et la date de candidature, exprime ta motivation toujours intacte, et pose une question concrète (calendrier de recrutement, prochaine étape). Si pas de réponse après 2 relances, passe à la suite — insister au-delà devient contre-productif. Dans ARTEMSI, tu notes tes relances directement dans le suivi candidatures pour ne rien oublier.",
    },

    // ── Catégorie 3 : ARTEMSI — la plateforme ────────────────────────────────
    {
      id: "quest-ce-qu-artemsi",
      category: "artemsi",
      question: `Qu'est-ce qu'${brand} et à qui s'adresse la plateforme ?`,
      answerText: `${brand} est une plateforme dédiée à la recherche d'alternance en ingénierie et industrie en France. Tu centralises profil, CV, lettre de motivation, offres ciblées et suivi candidatures dans un seul espace. Elle s'adresse aux étudiants en école d'ingénieurs, BTS, BUT, licence pro ou master qui cherchent une alternance dans les secteurs industrie, tech, commerce ou autres filières. Inscription gratuite sur ${site} ; la formule Pro débloque le matching complet, les offres exclusives partenaires et l'accompagnement humain.`,
    },
    {
      id: "vs-indeed-linkedin",
      category: "artemsi",
      question: `En quoi ${brand} est différent d'Indeed, LinkedIn ou Hellowork ?`,
      answerText: `Indeed, LinkedIn ou Hellowork diffusent du volume : tu cherches parmi des milliers d'offres, tu filtres, tu postules partout — souvent dans le vide. ${brand} inverse la logique : les offres compatibles avec ton profil arrivent dans ton dashboard selon ton domaine, ta région et ton type de contrat. Tu suis chaque candidature dans un tableau de bord unique, et en Pro tu accèdes aux offres exclusives partenaires entreprises, aux guides CV/LM par offre et à 3 appels personnalisés d'une heure par mois avec un humain — pas un chatbot.`,
    },
    {
      id: "offres-exclusives",
      category: "artemsi",
      question: `Que sont les offres exclusives partenaires sur ${brand} ?`,
      answerText: `Ce sont des alternances publiées directement par des entreprises partenaires ${brand}, parfois en avant-première ou uniquement sur la plateforme. En compte gratuit, tu peux les découvrir et consulter les détails. En Pro, tu postules directement avec un guide candidat adapté à chaque offre (CV et lettre de motivation). Ces exclusives sont sélectionnées pour correspondre aux profils inscrits : l'objectif est la qualité du matching, pas le volume d'annonces.`,
    },
    {
      id: "accompagnement",
      category: "artemsi",
      question: `Comment fonctionne l'accompagnement humain chez ${brand} ?`,
      answerText: `Les abonnés Pro bénéficient de 3 appels personnalisés d'une heure par mois : relecture CV et lettre de motivation, revue des candidatures en cours, préparation entretien. Tu réserves un créneau directement dans l'application (2 jours à l'avance) ; un compte rendu avec tes actions prioritaires reste accessible dans ton espace après l'échange. Ce n'est pas un score automatique ni de l'IA : une personne qui connaît les difficultés de l'alternance examine ton dossier et te donne des retours concrets.`,
    },
    {
      id: "inscription",
      category: "artemsi",
      question: `Comment créer un compte gratuit sur ${brand} ?`,
      answerText: `Rends-toi sur ${site}/signup, inscris-toi avec ton email et un mot de passe — sans carte bancaire. Complète l'onboarding en quelques minutes (métier visé, région, école, type de contrat) pour recevoir tes premières offres matchées et accéder au suivi de candidatures. Tu pourras passer Pro depuis ton dashboard quand tu le souhaites, avec ${billingTrialShortLabel()} pour tester toutes les fonctionnalités avant le premier prélèvement.`,
    },
    {
      id: "gratuit-pro",
      category: "artemsi",
      question: `${brand} Gratuit ou Pro : quelle différence ?`,
      answerText: `Gratuit : ${free}. Pro : ${pro}. L'essai Pro dure ${billingTrialShortLabel()}, puis ${billingMonthlyPriceLine()} sans engagement au-delà. Tu peux annuler à tout moment depuis ton profil.`,
    },
    {
      id: "prix-annulation",
      category: "artemsi",
      question: `Quel est le prix de ${brand} Pro et comment annuler ?`,
      answerText: `La formule Pro coûte ${billingMonthlyPriceLine()} après ${billingTrialShortLabel()} (${BILLING_TRIAL_DAYS} jours, aucun débit pendant l'essai). Tu peux annuler à tout moment depuis ton profil via le portail Stripe — annule avant la fin de la période en cours pour éviter le renouvellement du mois suivant. Aucun engagement minimum : tu t'abonnes et tu résilie quand tu veux.`,
    },
    {
      id: "france-idf",
      category: "artemsi",
      question: `${brand} fonctionne-t-il dans toute la France ?`,
      answerText: `Oui, ${brand} couvre toute la France métropolitaine. Tu renseignes ta région dans ton profil : le matching s'adapte à ta zone géographique. La plateforme est particulièrement orientée alternance ingénierie et industrie, avec des offres en Île-de-France, Auvergne-Rhône-Alpes, Hauts-de-France, Grand Est et dans toutes les régions industrielles françaises. Le catalogue s'enrichit en continu via les partenariats avec les entreprises recrutant des alternants.`,
    },
  ];
}

export function buildLandingFaqJsonLd() {
  const entries = getLandingFaqEntries();

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answerText,
      },
    })),
  };
}
