import Image from "next/image";
import Link from "next/link";

import { SubscribeButton } from "@/components/billing/subscribe-button";
import { LandingPricingShowcase } from "@/components/landing/landing-pricing-showcase";
import { LandingTabs } from "@/components/landing/landing-tabs";
import { LegalFooterLinks } from "@/components/legal/legal-footer-links";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { legalConfig } from "@/lib/legal-config";

type HomeProps = {
  searchParams: Promise<{ account_deleted?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { account_deleted: accountDeleted } = await searchParams;

  return (
    <main className="landing-shell">
      <div className="landing-bg" aria-hidden="true">
        <div className="landing-bg-grid" />
        <div className="landing-bg-aurora landing-bg-aurora--a" />
        <div className="landing-bg-aurora landing-bg-aurora--b" />
        <div className="landing-bg-aurora landing-bg-aurora--c" />
      </div>

      <header className="landing-nav">
        <div className="landing-container landing-nav-inner">
          <Link href="/" className="brand-link" aria-label="Accueil ARTEMSI">
            <Image
              src="/artemsi-logo.png"
              alt="Logo Artemsi"
              width={40}
              height={40}
              className="brand-logo landing-brand-logo"
              priority
            />
            <span className="brand-name">ARTEMSI</span>
          </Link>

          <LandingTabs />

          <nav className="landing-nav-links" aria-label="Navigation principale">
            <Link href="/login" className="landing-nav-link">
              Connexion
            </Link>
            <SubscribeButton className="button-link landing-nav-cta">
              S&apos;abonner
            </SubscribeButton>
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
        <div className="landing-container landing-hero-inner">
          <div className="landing-hero-copy">
            <Link href="#landing-prix" className="landing-announce">
              <span className="landing-announce-dot" aria-hidden="true" />
              <span className="landing-announce-tag">Nouveau</span>
              <span className="landing-announce-text">
                Espace candidat ARTEMSI 2026
              </span>
              <span className="landing-announce-arrow" aria-hidden="true">
                →
              </span>
            </Link>

            <h1 className="hero-title landing-hero-title">
              Decroche ton alternance
              <br />
              sans <span className="landing-title-accent">le bruit</span>.
            </h1>
            <p className="hero-subtitle landing-hero-subtitle">
              ARTEMSI selectionne des offres d&apos;alternance directement depuis les sites
              carrieres officiels, puis te montre celles qui collent a ton profil. Un seul
              espace pour les offres, le suivi, les documents et l&apos;audit CV/LM.
            </p>

            <div className="landing-cta-row">
              <SubscribeButton className="button-link landing-cta-primary">
                S&apos;abonner — 19,90&nbsp;EUR / mois
                <span className="landing-cta-arrow" aria-hidden="true">→</span>
              </SubscribeButton>
              <a
                className="button-link secondary-link landing-cta-secondary"
                href={`mailto:${legalConfig.contactEmail}`}
              >
                Nous contacter
              </a>
            </div>

            <ul className="landing-trust-list" aria-label="Engagements">
              <li>
                <span className="landing-trust-dot" aria-hidden="true" />
                Offres issues de sites carrieres officiels et sources entreprises
              </li>
              <li>
                <span className="landing-trust-dot" aria-hidden="true" />
                19,90 EUR / mois — un seul abonnement, acces immediat
              </li>
              <li>
                <span className="landing-trust-dot" aria-hidden="true" />
                Matching selon ton métier cible, ta region et ton type de contrat
              </li>
            </ul>
          </div>

          <div className="landing-hero-visual" aria-hidden="true">
            <div className="landing-hero-glow" />
            <div className="landing-mock landing-mock-main">
              <div className="landing-mock-head">
                <span className="landing-mock-dot" />
                <span className="landing-mock-dot" />
                <span className="landing-mock-dot" />
                <span className="landing-mock-title">Mon tableau de bord</span>
              </div>
              <div className="landing-mock-row">
                <div className="landing-mock-bar landing-mock-bar--lg" />
                <div className="landing-mock-bar landing-mock-bar--md" />
              </div>
              <div className="landing-mock-grid">
                <div className="landing-mock-tile">
                  <span className="landing-mock-tile-label">Sources</span>
                  <span className="landing-mock-tile-value">Officielles</span>
                </div>
                <div className="landing-mock-tile">
                  <span className="landing-mock-tile-label">Tri</span>
                  <span className="landing-mock-tile-value">Profil</span>
                </div>
                <div className="landing-mock-tile">
                  <span className="landing-mock-tile-label">Match</span>
                  <span className="landing-mock-tile-value">94%</span>
                </div>
              </div>
              <div className="landing-mock-row">
                <div className="landing-mock-line" />
                <div className="landing-mock-line landing-mock-line--short" />
                <div className="landing-mock-line landing-mock-line--medium" />
              </div>
            </div>

            <div className="landing-mock-float landing-mock-float--top">
              <div className="landing-float-pill">Nouvelle offre ciblée</div>
              <div className="landing-float-title">Data Analyst</div>
              <div className="landing-float-meta">Accenture · Paris</div>
              <div className="landing-float-match">94% · MATCH PARFAIT</div>
            </div>

            <div className="landing-mock-float landing-mock-float--bottom">
              <span className="landing-float-status">Candidature envoyee</span>
              <span className="landing-float-time">il y a 5 min</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-stats" aria-label="Chiffres ARTEMSI">
        <div className="landing-container landing-stats-grid">
          <div className="landing-stat">
            <span className="landing-stat-value">Source</span>
            <span className="landing-stat-label">Offres issues de pages carrieres officielles</span>
          </div>
          <div className="landing-stat">
            <span className="landing-stat-value">Profil</span>
            <span className="landing-stat-label">Matching métier, region et type de contrat</span>
          </div>
          <div className="landing-stat">
            <span className="landing-stat-value">Suivi</span>
            <span className="landing-stat-label">
              Offres, candidatures, documents et audit dans un seul espace.
            </span>
          </div>
        </div>
      </section>

      <section id="landing-candidatures" className="landing-section landing-how landing-scroll-target">
        <div className="landing-container">
          <div className="landing-section-head">
            <span className="landing-kicker">Comment ca marche</span>
            <h2 className="landing-section-title">
              3 etapes pour decrocher ton alternance
            </h2>
            <p className="landing-section-lead">
              ARTEMSI part des sites carrieres officiels et des sources entreprises, puis
              transforme ce flux en offres lisibles dans ton espace candidat.
            </p>
          </div>

          <ol className="landing-steps">
            <li className="landing-step">
              <span className="landing-step-num">01</span>
              <h3 className="landing-step-title">Cree ton profil</h3>
              <p className="landing-step-text">
                Renseigne ton parcours, tes preferences et upload ton CV. Cela prend 2 minutes.
              </p>
            </li>
            <li className="landing-step">
              <span className="landing-step-num">02</span>
              <h3 className="landing-step-title">Recois des offres ciblees</h3>
              <p className="landing-step-text">
                ARTEMSI classe les alternances selon ton profil, ta region et ton rythme —
                avec un lien vers la source officielle quand tu veux postuler.
              </p>
            </li>
            <li className="landing-step">
              <span className="landing-step-num">03</span>
              <h3 className="landing-step-title">Postule et avance</h3>
              <p className="landing-step-text">
                Postule en un clic, suis tes candidatures et prepare tes entretiens dans
                un seul tableau de bord.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section className="landing-section landing-features">
        <div className="landing-container">
          <div className="landing-section-head">
            <span className="landing-kicker">Fonctionnalites</span>
            <h2 className="landing-section-title">Tout ce dont vous avez besoin pour réussir</h2>
            <p className="landing-section-lead">
              ARTEMSI structure ta recherche d&apos;alternance avec des offres issues de sources
              officielles, un matching clair avec ton profil et un gros gain de temps : moins
              de bruit, plus d&apos;actions utiles — plus un accompagnement personnalise.
            </p>
          </div>

          <div className="landing-bento">
            <article className="landing-bento-card landing-bento-card--feature">
              <div className="landing-bento-feature-head">
                <span className="landing-bento-emoji landing-bento-emoji--hero" aria-hidden="true">
                  🎯
                </span>
              </div>
              <h3 className="landing-bento-title">Offres ciblées</h3>
              <p className="landing-bento-text">
                Accede a des offres d&apos;alternance selectionnees depuis des sites carrieres
                officiels et classees selon ton profil.
              </p>

              <div className="landing-bento-preview" aria-hidden="true">
                <div className="landing-bento-row">
                  <span className="landing-bento-pill">Data Analyst</span>
                  <span className="landing-bento-pill">Paris</span>
                  <span className="landing-bento-pill">Ciblée ARTEMSI</span>
                </div>
                <div className="landing-bento-row">
                  <div className="landing-bento-line" />
                  <div className="landing-bento-line landing-bento-line--short" />
                </div>
                <div className="landing-bento-match">
                  <span className="landing-bento-match-bar">
                    <span className="landing-bento-match-fill" />
                  </span>
                  <span className="landing-bento-match-label">MATCH PARFAIT · 94%</span>
                </div>
              </div>
            </article>

            <article className="landing-bento-card">
              <span className="landing-bento-emoji" aria-hidden="true">
                ⏱️
              </span>
              <h3 className="landing-bento-title">Gagne un temps fou</h3>
              <p className="landing-bento-text">
                Tu ne passes plus des soirees a ouvrir dix onglets carriere : ce qui compte
                arrive dans ton espace, deja trie pour toi.
              </p>
            </article>

            <article className="landing-bento-card">
              <span className="landing-bento-emoji" aria-hidden="true">
                🧩
              </span>
              <h3 className="landing-bento-title">Matching offres / profil</h3>
              <p className="landing-bento-text">
                Chaque proposition est pensee pour coller a ton parcours, tes preferences et ton
                objectif : tu vois tout de suite pourquoi l&apos;offre a du sens pour toi.
              </p>
            </article>

            <article className="landing-bento-card">
              <span className="landing-bento-emoji" aria-hidden="true">
                🔍
              </span>
              <h3 className="landing-bento-title">Audit de profil</h3>
              <p className="landing-bento-text">
                Analyse complète de votre profil, motivations et conseils personnalisés pour améliorer
                vos candidatures.
              </p>
            </article>

            <article className="landing-bento-card">
              <span className="landing-bento-emoji" aria-hidden="true">
                👥
              </span>
              <h3 className="landing-bento-title">Accompagnement personnalisé</h3>
              <p className="landing-bento-text">
                Un conseiller dédié vous guide dans votre recherche et vous prépare aux entretiens.
              </p>
            </article>

            <article className="landing-bento-card">
              <span className="landing-bento-emoji" aria-hidden="true">
                ⚡
              </span>
              <h3 className="landing-bento-title">Recherche plus claire</h3>
              <p className="landing-bento-text">
                Moins de dispersion, plus de matchs pertinents : tu sais quoi traiter en premier
                sans ouvrir toutes les pages carrieres.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="landing-audit" className="landing-section landing-audit-explainer landing-scroll-target">
        <div className="landing-container">
          <div className="landing-section-head">
            <span className="landing-kicker">Audit de profil</span>
            <h2 className="landing-section-title">Un rendez-vous pour debloquer ton dossier</h2>
            <p className="landing-section-lead">
              L&apos;audit de profil se reserve directement dans ton espace ARTEMSI. Tu choisis un
              creneau, l&apos;equipe confirme la demande, puis un expert analyse ton CV, ton profil
              LinkedIn et tes motivations pour te donner des conseils concrets d&apos;amelioration.
            </p>
          </div>
          <ol className="landing-audit-timeline">
            <li className="landing-audit-step">
              <span className="landing-audit-step-num" aria-hidden="true">
                1
              </span>
              <div className="landing-audit-step-body">
                <h3 className="landing-audit-step-title">Reservation</h3>
                <p className="landing-audit-step-text">
                  Tu choisis un creneau depuis l&apos;app : calendrier semaine (18h-22h) et week-end
                  (10h-14h). La demande part a l&apos;equipe ARTEMSI.
                </p>
              </div>
            </li>
            <li className="landing-audit-step">
              <span className="landing-audit-step-num" aria-hidden="true">
                2
              </span>
              <div className="landing-audit-step-body">
                <h3 className="landing-audit-step-title">Analyse</h3>
                <p className="landing-audit-step-text">
                  Passage en revue de ton CV, de ta lettre si tu en as une, coherence avec ton objectif
                  alternance et premiers axes de correction.
                </p>
              </div>
            </li>
            <li className="landing-audit-step">
              <span className="landing-audit-step-num" aria-hidden="true">
                3
              </span>
              <div className="landing-audit-step-body">
                <h3 className="landing-audit-step-title">Feedback</h3>
                <p className="landing-audit-step-text">
                  Conseils actionnables : formulation, structure, mots-cles et posture candidat. Tu repars
                  avec une feuille de route claire pour postuler plus fort.
                </p>
              </div>
            </li>
          </ol>
          <p className="landing-audit-note">
            La validation du creneau se fait par l&apos;equipe ; tu recois une confirmation ou un contre-projet
            par email, puis un rappel dans l&apos;app une fois l&apos;audit valide.
          </p>
        </div>
      </section>

      <section id="landing-offres" className="landing-section landing-offers-showcase landing-scroll-target">
        <div className="landing-container">
          <div className="landing-section-head">
            <span className="landing-kicker">Sources officielles</span>
            <h2 className="landing-section-title">Exemples d&apos;offres que l&apos;on sait traiter</h2>
          </div>
          <ul className="landing-offers-list" aria-label="Exemples d&apos;offres">
            <li className="landing-offers-row">
              <span className="landing-offers-role">Data-Analyst</span>
              <span className="landing-offers-co">Accenture</span>
              <span className="landing-offers-loc">Paris 13ème</span>
              <span className="landing-offers-badge">Exemple ARTEMSI</span>
            </li>
            <li className="landing-offers-row">
              <span className="landing-offers-role">Chargé de Marketing Digital</span>
              <span className="landing-offers-co">Publicis Groupe</span>
              <span className="landing-offers-loc">Lyon</span>
              <span className="landing-offers-badge">Exemple ARTEMSI</span>
            </li>
            <li className="landing-offers-row">
              <span className="landing-offers-role">Assistant Communication</span>
              <span className="landing-offers-co">Michelin</span>
              <span className="landing-offers-loc">Bordeaux</span>
              <span className="landing-offers-badge">Exemple ARTEMSI</span>
            </li>
            <li className="landing-offers-row">
              <span className="landing-offers-role">Consultant en Stratégie</span>
              <span className="landing-offers-co">Capgemini</span>
              <span className="landing-offers-loc">Lille</span>
              <span className="landing-offers-badge">Exemple ARTEMSI</span>
            </li>
            <li className="landing-offers-row">
              <span className="landing-offers-role">Designer UX/UI</span>
              <span className="landing-offers-co">Airbus</span>
              <span className="landing-offers-loc">Toulouse</span>
              <span className="landing-offers-badge">Exemple ARTEMSI</span>
            </li>
            <li className="landing-offers-row">
              <span className="landing-offers-role">Chargé de Recrutement</span>
              <span className="landing-offers-co">BNP Paribas</span>
              <span className="landing-offers-loc">Nantes</span>
              <span className="landing-offers-badge">Exemple ARTEMSI</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="landing-section landing-social-proof">
        <div className="landing-container">
          <div className="landing-section-head">
            <span className="landing-kicker">Expérience candidat</span>
            <p className="landing-social-proof-trust">Ce que l&apos;espace ARTEMSI apporte</p>
            <h2 className="landing-section-title">Une recherche plus lisible, moins dispersée</h2>
          </div>
          <ul className="landing-testimonials">
            <li className="landing-testimonial">
              <blockquote className="landing-testimonial-quote">
                « Je centralise mes offres, mes documents et mon suivi au même endroit, sans
                repartir de zéro à chaque candidature. »
              </blockquote>
              <p className="landing-testimonial-source">
                <span className="landing-testimonial-avatar" aria-hidden="true">
                  L
                </span>
                <span>
                  <strong className="landing-testimonial-name">Profil marketing</strong>
                  <span className="landing-testimonial-via"> · Parcours candidat</span>
                </span>
              </p>
            </li>
            <li className="landing-testimonial">
              <blockquote className="landing-testimonial-quote">
                « Les offres sont plus faciles à prioriser : je comprends rapidement lesquelles
                correspondent à mon profil et à ma zone de recherche. »
              </blockquote>
              <p className="landing-testimonial-source">
                <span className="landing-testimonial-avatar" aria-hidden="true">
                  T
                </span>
                <span>
                  <strong className="landing-testimonial-name">Profil commerce</strong>
                  <span className="landing-testimonial-via"> · Matching</span>
                </span>
              </p>
            </li>
            <li className="landing-testimonial">
              <blockquote className="landing-testimonial-quote">
                « L&apos;audit aide à voir ce qui bloque dans le CV, la lettre et la posture avant
                d&apos;envoyer trop de candidatures. »
              </blockquote>
              <p className="landing-testimonial-source">
                <span className="landing-testimonial-avatar" aria-hidden="true">
                  C
                </span>
                <span>
                  <strong className="landing-testimonial-name">Profil communication</strong>
                  <span className="landing-testimonial-via"> · Audit</span>
                </span>
              </p>
            </li>
            <li className="landing-testimonial">
              <blockquote className="landing-testimonial-quote">
                « Le suivi des candidatures rend la recherche plus propre : je sais quoi relancer,
                quoi archiver et quoi préparer. »
              </blockquote>
              <p className="landing-testimonial-source">
                <span className="landing-testimonial-avatar" aria-hidden="true">
                  S
                </span>
                <span>
                  <strong className="landing-testimonial-name">Profil tech</strong>
                  <span className="landing-testimonial-via"> · Suivi</span>
                </span>
              </p>
            </li>
          </ul>
        </div>
      </section>

      <LandingPricingShowcase />

      <section id="landing-faq" className="landing-section landing-faq landing-scroll-target">
        <div className="landing-container">
          <div className="landing-section-head">
            <span className="landing-kicker">FAQ</span>
            <h2 className="landing-section-title">Questions fréquemment posées</h2>
          </div>
          <div className="landing-faq-list">
            <details className="landing-faq-item">
              <summary>Pourquoi payer sans essai gratuit ?</summary>
              <p>
                L&apos;acces aux offres poussees, au matching et au suivi est actif des la souscription :
                pas de demo gratuite. Tu paies pour gagner du temps tout de suite. Tu peux resilier ton
                abonnement a tout moment ; les modalites de facturation et de retractation sont celles
                indiquees au paiement (Stripe) et dans les conditions contractuelles.
              </p>
            </details>
            <details className="landing-faq-item">
              <summary>Comment fonctionnent les offres ciblées ?</summary>
              <p>
                ARTEMSI selectionne des offres depuis les sites carrieres officiels et les sources
                entreprises, puis les classe selon ton profil : métier cible, region, type de contrat,
                domaine d&apos;etudes et centres d&apos;interet. Le lien de candidature renvoie vers la source.
              </p>
            </details>
            <details className="landing-faq-item">
              <summary>Comment se déroule l&apos;audit de profil ?</summary>
              <p>
                L&apos;audit de profil se reserve depuis l&apos;espace ARTEMSI : tu choisis un creneau,
                l&apos;equipe confirme ou propose un autre horaire, puis un expert analyse ton CV, ton
                profil LinkedIn et tes motivations pour te donner des conseils concrets
                d&apos;amelioration.
              </p>
            </details>
            <details className="landing-faq-item">
              <summary>Combien de temps faut-il pour trouver une alternance ?</summary>
              <p>
                Ca depend fortement du profil, du secteur et du marche : il n&apos;y a pas de delai
                universel. ARTEMSI aide surtout a gagner du temps sur le tri des offres issues des
                sources officielles, la preparation du dossier et le suivi des candidatures.
              </p>
            </details>
            <details className="landing-faq-item">
              <summary>Puis-je annuler mon abonnement à tout moment ?</summary>
              <p>
                Oui, vous pouvez annuler votre abonnement à tout moment sans frais supplémentaires. Votre
                accès aux services reste actif jusqu&apos;à la fin de votre période de facturation.
              </p>
            </details>
            <details className="landing-faq-item">
              <summary>Quels domaines d&apos;activité couvrez-vous ?</summary>
              <p>
                L&apos;objectif est de couvrir les principaux domaines d&apos;alternance : tech, marketing,
                finance, RH, ingenierie, commerce, communication et fonctions support. La pertinence
                depend ensuite des offres disponibles et de ton profil.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="landing-section landing-cta-final">
        <div className="landing-container">
          <div className="landing-cta-final-card">
            <div className="landing-cta-final-glow" aria-hidden="true" />
            <span className="landing-kicker">Pret a commencer ?</span>
            <h2 className="landing-section-title landing-cta-final-title">
              Trouver une alternance, c&apos;est souvent{" "}
              <span className="landing-title-accent">extrêmement compliqué</span>.
            </h2>
            <p className="landing-section-lead landing-cta-final-lead">
              Simplifie-toi la vie : les offres issues de sources officielles viennent a toi avec
              un matching clair sur ton profil, le suivi des candidatures et des documents prets a
              l&apos;envoi — puis souscription en ligne (Stripe) des
              19,90&nbsp;EUR&nbsp;/&nbsp;mois. Le rythme reel depend de ton profil, du secteur et du marche.
            </p>
            <div className="landing-cta-row landing-cta-final-actions landing-cta-final-actions--single">
              <SubscribeButton className="button-link landing-cta-primary">
                S&apos;abonner maintenant
                <span className="landing-cta-arrow" aria-hidden="true">→</span>
              </SubscribeButton>
            </div>
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
