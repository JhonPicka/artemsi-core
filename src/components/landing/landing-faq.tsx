import Link from "next/link";
import type { ReactNode } from "react";

import { getFreshSignupGratuitPath } from "@/lib/auth-paths";
import {
  billingMonthlyPriceLine,
  billingTrialShortLabel,
  BILLING_TRIAL_DAYS,
} from "@/lib/billing-offer";
import { legalConfig } from "@/lib/legal-config";

type FaqItem = {
  question: string;
  answer: ReactNode;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Je cherche une alternance : c'est pour moi ?",
    answer: (
      <>
        Oui. ARTEMSI est pensé pour les étudiants en alternance, quel que soit ton secteur. Dès
        l&apos;onboarding, tu renseignes métier, région, école et type de contrat — les offres et le
        suivi s&apos;adaptent à ton profil.
      </>
    ),
  },
  {
    question: "Gratuit ou Pro : quelle différence ?",
    answer: (
      <>
        <strong>Gratuit</strong> — inscription sans carte,{" "}
        <strong>50 % du jobboard</strong> (hors dernières offres), suivi candidatures, profil et{" "}
        <strong>1 à 2 offres assignées</strong>. <strong>Pro</strong> — matching sur{" "}
        <strong>100 % du jobboard</strong>, offres exclusives, guides CV/LM et{" "}
        <strong>3 appels de 1 h par mois</strong> avec un humain. Essai :{" "}
        <strong>{billingTrialShortLabel()}</strong>, puis{" "}
        <strong>{billingMonthlyPriceLine()}</strong>.
      </>
    ),
  },
  {
    question: "En quoi c'est différent d'un job board ?",
    answer: (
      <>
        Les offres viennent à toi selon ton profil, pas l&apos;inverse. Tu suis tes candidatures
        dans un seul espace et tu peux réserver un accompagnement sur ton dossier —{" "}
        <strong>postuler mieux</strong>, pas juste plus.
      </>
    ),
  },
  {
    question: "Comment se déroule l'accompagnement ?",
    answer: (
      <>
        <strong>Pro</strong> : <strong>3 appels de 1 h par mois</strong> — tu réserves un créneau
        dans l&apos;app (2 jours à l&apos;avance), on confirme ou on te repropose un horaire. Un{" "}
        <strong>rapport</strong> avec tes actions prioritaires reste dans ton espace après
        l&apos;échange. ARTEMSI peut aussi proposer ponctuellement un mini-audit découverte (10 min)
        en opération promo — ce n&apos;est pas inclus automatiquement dans le compte Gratuit.
      </>
    ),
  },
  {
    question: "Comment accéder à mon espace ?",
    answer: (
      <>
        <Link href={getFreshSignupGratuitPath()}>Crée ton compte gratuit</Link> ou passe Pro depuis ton espace. Connexion
        avec l&apos;email utilisé à l&apos;inscription. Email introuvable ? Vérifie les spams. Bloqué ?{" "}
        <a href={`mailto:${legalConfig.contactEmail}`}>Contacte-nous</a>.
      </>
    ),
  },
  {
    question: "Essai Pro et annulation",
    answer: (
      <>
        L&apos;essai Pro dure <strong>{BILLING_TRIAL_DAYS} jours</strong>, sans débit pendant cette
        période. Ensuite : <strong>{billingMonthlyPriceLine()}</strong> sauf résiliation avant la
        fin. Annulation à tout moment depuis ton profil (portail Stripe). Détails dans les{" "}
        <Link href="/cgu">CGU</Link>.
      </>
    ),
  },
];

export function LandingFaq() {
  return (
    <section id="landing-faq" className="landing-section landing-faq landing-scroll-target">
      <div className="landing-container">
        <div className="landing-section-head landing-faq-head">
          <span className="landing-kicker">FAQ</span>
          <h2 className="landing-section-title">Questions fréquemment posées</h2>
          <p className="landing-section-lead">
            L&apos;essentiel sur le gratuit, Pro et l&apos;accompagnement humain.
          </p>
        </div>
        <div className="landing-faq-list">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="landing-faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
