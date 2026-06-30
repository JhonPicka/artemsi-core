import Link from "next/link";

import { BrandMark } from "@/components/brand/brand-mark";
import { LandingAppPreview } from "@/components/landing/landing-app-preview";
import { LandingDualCta } from "@/components/landing/landing-dual-cta";
import {
  LandingTikTokCommentsCarousel,
} from "@/components/landing/landing-hero-tiktok-reviews";
import { LandingHeroVisualPanel } from "@/components/landing/landing-hero-preview-box";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingInvestmentQuote } from "@/components/landing/landing-investment-quote";
import { LandingJsonLd } from "@/components/landing/landing-json-ld";
import { LandingPlanCompare } from "@/components/landing/landing-plan-compare";
import { LandingStatsFilet } from "@/components/landing/landing-stats-filet";
import { LandingTabs } from "@/components/landing/landing-tabs";
import { LegalFooterLinks } from "@/components/legal/legal-footer-links";
import { billingProAuditShortLabel } from "@/lib/billing-offer";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  billingMonthlyPriceLine,
  billingTrialShortLabel,
} from "@/lib/billing-offer";
import { legalConfig } from "@/lib/legal-config";

type HomeProps = {
  searchParams: Promise<{ account_deleted?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { account_deleted: accountDeleted } = await searchParams;

  return (
    <main className="landing-shell">
      <LandingJsonLd />
      <div className="landing-bg" aria-hidden="true">
        <div className="landing-bg-grid" />
        <div className="landing-bg-aurora landing-bg-aurora--a" />
        <div className="landing-bg-aurora landing-bg-aurora--b" />
        <div className="landing-bg-aurora landing-bg-aurora--c" />
      </div>

      <header className="landing-nav">
        <div className="landing-container landing-nav-inner">
          <BrandMark
            href="/"
            size={40}
            logoClassName="brand-logo landing-brand-logo"
          />

          <LandingTabs />

          <nav className="landing-nav-links" aria-label="Accès compte">
            <Link href="/login" prefetch={false} className="button-link landing-nav-cta">
              Connexion
            </Link>
          </nav>
        </div>
      </header>

      {accountDeleted === "1" ? (
        <div className="landing-container landing-account-deleted-banner" role="status">
          <p>
            Ton compte ARTEMSI a bien été supprimé. Merci d&apos;avoir utilisé le service — bonne
            continuation pour la suite !
          </p>
        </div>
      ) : null}

      <section id="landing-accueil" className="landing-hero landing-scroll-target">
        <div className="landing-container landing-hero-wireframe">
          <div className="landing-hero-left">
            <div className="landing-hero-copy">
              <Link href="#landing-prix" className="landing-announce landing-hero-announce">
                <span className="landing-announce-dot" aria-hidden="true" />
                <span className="landing-announce-tag">Abonnement Pro</span>
                <span className="landing-announce-text">
                  {billingTrialShortLabel()} — puis {billingMonthlyPriceLine()}
                </span>
                <span className="landing-announce-arrow" aria-hidden="true">
                  →
                </span>
              </Link>

              <div className="landing-hero-copy-main">
                <div className="landing-hero-copy-intro">
                  <h1 className="hero-title landing-hero-title">
                    Tu veux profiter de l&apos;été ?<br />
                    Trouve ton alternance
                  </h1>
                  <div className="hero-subtitle landing-hero-subtitle landing-hero-subtitle-stack">
                    <p>
                      T&apos;en as marre d&apos;envoyer 100 candidatures par semaine pour recevoir
                      uniquement des refus automatiques ?
                    </p>
                    <p>ARTEMSI remédie à ça.</p>
                  </div>
                </div>

                <div className="landing-hero-copy-actions">
                  <LandingDualCta className="landing-cta-row landing-hero-cta-desktop" />

                  {/* PC/tablette uniquement : trust list */}
                  <ul className="landing-trust-list landing-trust-list--desktop" aria-label="Engagements">
                    <li>
                      <span className="landing-trust-dot" aria-hidden="true" />
                      Des offres qui match ton profil
                    </li>
                    <li>
                      <span className="landing-trust-dot" aria-hidden="true" />
                      1 h par rendez-vous d&apos;accompagnement
                    </li>
                    <li>
                      <span className="landing-trust-dot" aria-hidden="true" />
                      Dashboard interactif qui te permet de suivre tes avancées
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <LandingHeroVisualPanel />
        </div>

        <div className="landing-container landing-hero-carousel-wrap">
          <LandingTikTokCommentsCarousel />
        </div>
      </section>

      <section id="landing-candidatures" className="landing-section landing-how landing-scroll-target">
        <div className="landing-container">
          <div className="landing-section-head">
            <span className="landing-kicker">Comment ça marche</span>
            <h2 className="landing-section-title">
              3 étapes pour décrocher ton alternance
            </h2>
            <p className="landing-section-lead">
              Inscris-toi gratuitement, complète ton profil, reçois des offres adaptées — Pro pour
              l&apos;accompagnement humain.
            </p>
          </div>

          <ol className="landing-steps">
            <li className="landing-step">
              <span className="landing-step-num">01</span>
              <h3 className="landing-step-title">Crée ton compte et complète ton profil (~2 min)</h3>
              <div className="landing-step-body">
                <p className="landing-step-text">
                  Inscription gratuite, sans carte. Tu renseignes métier, région, école — ton espace
                  est prêt.
                </p>
              </div>
            </li>
            <li className="landing-step">
              <span className="landing-step-num">02</span>
              <h3 className="landing-step-title">
                Reçois des offres qui matchent et suis ta progression
              </h3>
              <div className="landing-step-body">
                <p className="landing-step-text">
                  Des offres adaptées arrivent dans ton dashboard, avec un lien direct pour
                  postuler.
                </p>
                <p className="landing-step-text">
                  Tu pilotes tes candidatures, relances et prochaines actions depuis un seul espace.
                </p>
              </div>
            </li>
            <li className="landing-step">
              <span className="landing-step-num">03</span>
              <h3 className="landing-step-title">Passe Pro pour être accompagné</h3>
              <div className="landing-step-body">
                <p className="landing-step-text">
                  Matching complet, offres exclusives partenaires, guides CV/LM et{" "}
                  <strong>{billingProAuditShortLabel()}</strong> avec un humain — pas de score, pas
                  d&apos;IA à la place de l&apos;échange.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <LandingStatsFilet />

      <LandingAppPreview />

      <section id="landing-audit" className="landing-section landing-audit-explainer landing-scroll-target">
        <div className="landing-container">
          <div className="landing-section-head">
            <span className="landing-kicker">Accompagnement personnalisé</span>
            <h2 className="landing-section-title">Un rendez-vous d&apos;1 h pour booster ton dossier</h2>
            <p className="landing-section-lead landing-audit-lead">
              <span className="landing-kicker landing-audit-pro-tag">Inclus dans l&apos;offre Pro</span>
              <strong>{billingProAuditShortLabel()}</strong>.
              <br />
              Tu réserves un créneau avec quelqu&apos;un qui sait ce que les entreprises veulent et
              connaît ton profil — pas besoin de score ni d&apos;IA. Tu choisis ton horaire dans le
              calendrier de l&apos;app (2 jours à l&apos;avance) ; on confirme ou on te propose un autre
              créneau. Tu repars avec un plan d&apos;action clair pour décrocher plus d&apos;entretiens.
            </p>
          </div>

          <ul className="landing-audit-focus">
            <li className="landing-audit-focus-card">
              <h3 className="landing-audit-focus-title">CV &amp; lettre de motivation</h3>
              <p className="landing-audit-focus-text">
                Formulation, structure et mots-clés : on aligne ton dossier à ton objectif
                d&apos;alternance (tout secteur).
              </p>
            </li>
            <li className="landing-audit-focus-card">
              <h3 className="landing-audit-focus-title">Candidatures en cours</h3>
              <p className="landing-audit-focus-text">
                On passe en revue les offres auxquelles tu as déjà postulé, ce qui bloque et les
                relances à prioriser pour augmenter tes chances d&apos;entretiens.
              </p>
            </li>
            <li className="landing-audit-focus-card">
              <h3 className="landing-audit-focus-title">Entretiens &amp; posture candidat</h3>
              <p className="landing-audit-focus-text">
                Préparation concrète : comment te présenter, répondre aux questions récurrentes et
                valoriser ton parcours face à un recruteur.
              </p>
            </li>
            <li className="landing-audit-focus-card">
              <h3 className="landing-audit-focus-title">Compte rendu dans l&apos;app</h3>
              <p className="landing-audit-focus-text">
                Après l&apos;échange, un rapport reste disponible dans ton espace. Il contient les
                actions prioritaires et les prochaines étapes à effectuer.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <LandingInvestmentQuote />

      <LandingPlanCompare />

      <LandingFaq />

      <section className="landing-section landing-cta-final">
        <div className="landing-container">
          <div className="landing-cta-final-card">
            <div className="landing-cta-final-glow" aria-hidden="true" />
            <span className="landing-kicker">Prêt à commencer ?</span>
            <h2 className="landing-section-title landing-cta-final-title">
              Trouver une alternance, c&apos;est souvent{" "}
              <span className="landing-title-accent">extrêmement compliqué</span>.
            </h2>
            <p className="landing-section-lead landing-cta-final-lead">
              Choisis la formule qui te convient : jobboard et suivi gratuit, ou matching complet
              avec accompagnement humain — pour ton alternance en ingénierie et industrie, partout
              en France.
            </p>
            <LandingDualCta className="landing-cta-row landing-cta-final-actions" />
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <span>© {new Date().getFullYear()} ARTEMSI · Espace candidat alternance</span>
          <nav className="landing-footer-links" aria-label="Liens pied de page">
            <LegalFooterLinks />
            <a href={legalConfig.publicSiteUrl} target="_blank" rel="noopener noreferrer">
              {legalConfig.publicSiteLabel}
            </a>
            <a href={`mailto:${legalConfig.contactEmail}`}>Contact</a>
          </nav>
          <ThemeToggle variant="compact" className="landing-footer-theme" />
        </div>
      </footer>
    </main>
  );
}
