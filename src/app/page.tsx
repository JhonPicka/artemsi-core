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
                Trouve ton alternance et profite de l&apos;été
              </span>
              <span className="landing-announce-arrow" aria-hidden="true">
                →
              </span>
            </Link>

            <h1 className="hero-title landing-hero-title">
              Trouve ton alternance
              <br />
              et profite de l&apos;été.
            </h1>
            <p className="hero-subtitle landing-hero-subtitle">
              ARTEMSI te propose des offres ciblées qui collent à ton profil. Tu avances avec
              un seul espace pour les offres, le suivi, tes documents et l&apos;accompagnement
              personnalisé.
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
                Offres ciblees selon ton profil
              </li>
              <li>
                <span className="landing-trust-dot" aria-hidden="true" />
                19,90 EUR / mois — un seul abonnement, accès immédiat
              </li>
              <li>
                <span className="landing-trust-dot" aria-hidden="true" />
                Matching selon ton métier cible, ta région et ton type de contrat
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
              <span className="landing-float-status">Candidature envoyée</span>
              <span className="landing-float-time">il y a 5 min</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-stats" aria-label="Chiffres ARTEMSI">
        <div className="landing-container landing-stats-grid">
          <div className="landing-stat">
            <span className="landing-stat-value">+20%</span>
            <span className="landing-stat-label">
              d&apos;entretiens apres l&apos;accompagnement personnalise
            </span>
          </div>
          <div className="landing-stat">
            <span className="landing-stat-value">+5</span>
            <span className="landing-stat-label">
              entretiens en plus après le premier mois
            </span>
          </div>
          <div className="landing-stat">
            <span className="landing-stat-value">90%</span>
            <span className="landing-stat-label">
              d&apos;offres compatibles avec ton profil
            </span>
          </div>
        </div>
      </section>

      <section id="landing-candidatures" className="landing-section landing-how landing-scroll-target">
        <div className="landing-container">
          <div className="landing-section-head">
            <span className="landing-kicker">Comment ca marche</span>
            <h2 className="landing-section-title">
              3 étapes pour décrocher ton alternance
            </h2>
            <p className="landing-section-lead">
              Un parcours simple : paiement, activation, profil, offres et accompagnement.
            </p>
          </div>

          <ol className="landing-steps">
            <li className="landing-step">
              <span className="landing-step-num">01</span>
              <h3 className="landing-step-title">Paie, crée ton mot de passe et ton profil</h3>
              <p className="landing-step-text">
                Une fois le paiement validé, tu crées ton mot de passe puis tu complètes ton
                profil (comme dans l&apos;app) pour démarrer proprement.
              </p>
            </li>
            <li className="landing-step">
              <span className="landing-step-num">02</span>
              <h3 className="landing-step-title">Reçois des offres avec lien pour postuler</h3>
              <p className="landing-step-text">
                Tu reçois des offres ciblées dans ton espace, avec un lien direct pour postuler
                rapidement.
              </p>
            </li>
            <li className="landing-step">
              <span className="landing-step-num">03</span>
              <h3 className="landing-step-title">Prends un rendez-vous d&apos;accompagnement</h3>
              <p className="landing-step-text">
                Tu peux réserver un rendez-vous pour améliorer ton CV, tes candidatures et ta
                posture en entretien.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section className="landing-section landing-features">
        <div className="landing-container">
          <div className="landing-section-head">
            <span className="landing-kicker">Fonctionnalités</span>
            <h2 className="landing-section-title">Tout ce dont tu as besoin pour réussir</h2>
            <p className="landing-section-lead">
              ARTEMSI structure ta recherche d&apos;alternance avec des offres ciblées, un matching
              clair et un gros gain de temps : moins de bruit, plus d&apos;actions utiles.
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
                Accède à des offres d&apos;alternance ciblées et classées selon ton profil.
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
                Tu ne passes plus des soirées à ouvrir dix onglets carrière : ce qui compte
                arrive dans ton espace, déjà trié pour toi, avec ton CV et tes lettres de
                motivation stockés au même endroit.
              </p>
            </article>

            <article className="landing-bento-card">
              <span className="landing-bento-emoji" aria-hidden="true">
                🧩
              </span>
              <h3 className="landing-bento-title">Matching offres / profil</h3>
              <p className="landing-bento-text">
                Chaque proposition est pensée pour coller à ton parcours, tes préférences et ton
                objectif : tu vois tout de suite pourquoi l&apos;offre a du sens pour toi.
              </p>
            </article>

            <article className="landing-bento-card">
              <span className="landing-bento-emoji" aria-hidden="true">
                🔍
              </span>
              <h3 className="landing-bento-title">Accompagnement personnalisé</h3>
              <p className="landing-bento-text">
                Réserve un rendez-vous pour améliorer ton CV, tes candidatures et ton approche
                des entretiens.
              </p>
            </article>

            <article className="landing-bento-card">
              <span className="landing-bento-emoji" aria-hidden="true">
                👥
              </span>
              <h3 className="landing-bento-title">Conseils concrets chaque semaine</h3>
              <p className="landing-bento-text">
                Tu avances avec des retours clairs et actionnables pour postuler mieux chaque
                semaine.
              </p>
            </article>

            <article className="landing-bento-card">
              <span className="landing-bento-emoji" aria-hidden="true">
                ⚡
              </span>
              <h3 className="landing-bento-title">Plan d&apos;action clair</h3>
              <p className="landing-bento-text">
                Tu sais quoi faire en priorité : offres à traiter, candidatures à relancer et
                prochains objectifs.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="landing-audit" className="landing-section landing-audit-explainer landing-scroll-target">
        <div className="landing-container">
          <div className="landing-section-head">
            <span className="landing-kicker">Accompagnement personnalisé</span>
            <h2 className="landing-section-title">Un rendez-vous pour booster ton dossier</h2>
            <p className="landing-section-lead">
              L&apos;accompagnement personnalisé se réserve directement dans ton espace ARTEMSI. Tu
              choisis un créneau, l&apos;équipe confirme, puis un expert t&apos;aide à améliorer ton CV,
              tes candidatures et ton positionnement.
            </p>
          </div>
          <ol className="landing-audit-timeline">
            <li className="landing-audit-step">
              <span className="landing-audit-step-num" aria-hidden="true">
                1
              </span>
              <div className="landing-audit-step-body">
                <h3 className="landing-audit-step-title">Réservation</h3>
                <p className="landing-audit-step-text">
                  Tu choisis un créneau depuis l&apos;app : calendrier semaine (18h-22h) et week-end
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
                  Passage en revue de ton CV, de tes lettres de motivation et de la cohérence
                  avec ton objectif alternance.
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
                  Conseils actionnables : formulation, structure, mots-clés et posture candidat.
                  Tu repars avec une feuille de route claire.
                </p>
              </div>
            </li>
          </ol>
          <p className="landing-audit-note">
            La validation du créneau se fait par l&apos;équipe ; tu reçois une confirmation ou un
            contre-projet par email, puis un rappel dans l&apos;app.
          </p>
        </div>
      </section>

      <section id="landing-offres" className="landing-section landing-offers-showcase landing-scroll-target">
        <div className="landing-container">
          <div className="landing-section-head">
            <span className="landing-kicker">Offres ciblées</span>
            <h2 className="landing-section-title">Exemples d&apos;offres que l&apos;on traite</h2>
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
            <span className="landing-kicker">Avis candidats</span>
            <p className="landing-social-proof-trust">Ils te racontent ce que ça change</p>
            <h2 className="landing-section-title">Des retours concrets sur l&apos;accompagnement</h2>
          </div>
          <ul className="landing-testimonials">
            <li className="landing-testimonial">
              <blockquote className="landing-testimonial-quote">
                « L&apos;année dernière, j&apos;étais perdu sur mes candidatures. Avec les conseils
                d&apos;accompagnement, j&apos;ai clarifié mon CV et j&apos;ai enfin trouvé mon alternance. »
              </blockquote>
              <p className="landing-testimonial-source">
                <span className="landing-testimonial-avatar" aria-hidden="true">
                  R
                </span>
                <span>
                  <strong className="landing-testimonial-name">Rexer R</strong>
                  <span className="landing-testimonial-via"> · Alternance trouvée</span>
                </span>
              </p>
            </li>
            <li className="landing-testimonial">
              <blockquote className="landing-testimonial-quote">
                « Les offres que je reçois sont plus pertinentes et j&apos;ai beaucoup plus
                d&apos;entretiens qu&apos;avant grâce aux conseils. J&apos;ai vraiment senti la progression. »
              </blockquote>
              <p className="landing-testimonial-source">
                <span className="landing-testimonial-avatar" aria-hidden="true">
                  L
                </span>
                <span>
                  <strong className="landing-testimonial-name">Linda M</strong>
                  <span className="landing-testimonial-via"> · Plus d&apos;entretiens</span>
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
                L&apos;accès aux offres poussées, au matching et au suivi est actif dès la souscription :
                pas de démo gratuite. Tu paies pour gagner du temps tout de suite. Tu peux résilier ton
                abonnement à tout moment ; les modalités de facturation et de rétractation sont celles
                indiquées au paiement (Stripe) et dans les conditions contractuelles.
              </p>
            </details>
            <details className="landing-faq-item">
              <summary>Comment fonctionnent les offres ciblées ?</summary>
              <p>
                ARTEMSI te propose des offres ciblées puis les classe selon ton profil : métier
                cible, région, type de contrat, domaine d&apos;études et centres d&apos;intérêt.
                Tu retrouves un lien clair pour postuler rapidement.
              </p>
            </details>
            <details className="landing-faq-item">
              <summary>Comment se déroule l&apos;accompagnement personnalisé ?</summary>
              <p>
                L&apos;accompagnement se réserve depuis l&apos;espace ARTEMSI : tu choisis un créneau,
                l&apos;équipe confirme ou propose un autre horaire, puis un expert t&apos;aide à
                améliorer ton CV et tes candidatures.
              </p>
            </details>
            <details className="landing-faq-item">
              <summary>Combien de temps faut-il pour trouver une alternance ?</summary>
              <p>
                Ça dépend fortement du profil, du secteur et du marché : il n&apos;y a pas de délai
                universel. ARTEMSI aide surtout à gagner du temps sur le tri des offres, la
                préparation du dossier et le suivi des candidatures.
              </p>
            </details>
            <details className="landing-faq-item">
              <summary>Puis-je annuler mon abonnement à tout moment ?</summary>
              <p>
                Oui, tu peux annuler ton abonnement à tout moment sans frais supplémentaires.
                Ton accès aux services reste actif jusqu&apos;à la fin de ta période de facturation.
              </p>
            </details>
            <details className="landing-faq-item">
              <summary>Quels domaines couvre ARTEMSI ?</summary>
              <p>
                L&apos;objectif est de couvrir les principaux domaines d&apos;alternance : tech, marketing,
                finance, RH, ingénierie, commerce, communication et fonctions support. La pertinence
                dépend ensuite des offres disponibles et de ton profil.
              </p>
            </details>
          </div>
        </div>
      </section>

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
              Simplifie-toi la vie : les offres viennent à toi avec un matching clair sur ton
              profil, le suivi des candidatures et des documents prêts à l&apos;envoi — puis
              souscription en ligne (Stripe) des
              19,90&nbsp;EUR&nbsp;/&nbsp;mois. Le rythme réel dépend de ton profil, du secteur et du marché.
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
