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

      <section className="landing-stats" aria-label="Points clés ARTEMSI">
        <div className="landing-container landing-stats-grid">
          <div className="landing-stat">
            <span className="landing-stat-value">1 h</span>
            <span className="landing-stat-label">
              par rendez-vous d&apos;accompagnement (échange en direct)
            </span>
          </div>
          <div className="landing-stat">
            <span className="landing-stat-value">+10</span>
            <span className="landing-stat-label">
              offres ciblées ajoutées par jour selon ton profil
            </span>
          </div>
          <div className="landing-stat">
            <span className="landing-stat-value">×3</span>
            <span className="landing-stat-label">
              plus de chances de décrocher un entretien avec un meilleur CV
            </span>
          </div>
        </div>
      </section>

      <section id="landing-candidatures" className="landing-section landing-how landing-scroll-target">
        <div className="landing-container">
          <div className="landing-section-head">
            <span className="landing-kicker">Comment ca marche</span>
            <h2 className="landing-section-title">
              3 étapes pour décrocher ton alternance ou ton stage
            </h2>
            <p className="landing-section-lead">
              Paiement, activation, profil, offres ciblées puis rendez-vous d&apos;accompagnement si
              tu en as besoin.
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
              <h3 className="landing-step-title">Réserve un accompagnement (1 h)</h3>
              <p className="landing-step-text">
                Choisis un créneau dans l&apos;app : un expert relit ton CV et ta lettre, te donne
                des retours actionnables et t&apos;aide sur ta posture en entretien.
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
                Créneau d&apos;1 h en direct : relecture CV / lettre, cohérence avec ton objectif
                (alternance ou stage) et plan d&apos;action pour la suite.
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
            <h2 className="landing-section-title">Un rendez-vous d&apos;1 h pour booster ton dossier</h2>
            <p className="landing-section-lead">
              Réservé depuis ton espace ARTEMSI : un échange en direct (pas un score automatique).
              Que tu sois en BUT info, école de commerce ou autre, l&apos;objectif est le même — un
              dossier clair pour une alternance ou un stage.
            </p>
          </div>

          <aside className="landing-audit-practical" aria-label="Détails de l'accompagnement">
            <h3 className="landing-audit-practical-title">En pratique</h3>
            <ul className="landing-audit-practical-list">
              <li>
                <strong>Format :</strong> échange en direct d&apos;1 h avec un expert ARTEMSI (visio
                ou téléphone selon confirmation).
              </li>
              <li>
                <strong>Offres :</strong> environ 10 nouvelles offres ciblées par jour dans ton espace,
                selon ton métier et ta région.
              </li>
              <li>
                <strong>Inclus :</strong> relecture CV et lettre, cohérence métier / secteur, conseils
                entretien et priorités pour postuler.
              </li>
              <li>
                <strong>Hors scope :</strong> pas de rédaction intégrale de CV ou LM à ta place — tu
                repars avec des corrections et une feuille de route.
              </li>
              <li>
                <strong>Confirmation :</strong> l&apos;équipe valide ou propose un autre créneau sous 48 h,
                puis compte rendu visible dans l&apos;app.
              </li>
            </ul>
          </aside>

          <ol className="landing-audit-timeline">
            <li className="landing-audit-step">
              <span className="landing-audit-step-num" aria-hidden="true">
                1
              </span>
              <div className="landing-audit-step-body">
                <h3 className="landing-audit-step-title">Réservation</h3>
                <p className="landing-audit-step-text">
                  Tu choisis un créneau dans le calendrier de l&apos;app (7 jours à l&apos;avance). La
                  demande part à l&apos;équipe ARTEMSI avec tes notes éventuelles.
                </p>
              </div>
            </li>
            <li className="landing-audit-step">
              <span className="landing-audit-step-num" aria-hidden="true">
                2
              </span>
              <div className="landing-audit-step-body">
                <h3 className="landing-audit-step-title">Échange</h3>
                <p className="landing-audit-step-text">
                  Pendant 1 h : ton CV, ta lettre, ton objectif (alternance ou stage) et tes
                  candidatures en cours — avec des exemples concrets selon ton profil (tech, commerce,
                  etc.).
                </p>
              </div>
            </li>
            <li className="landing-audit-step">
              <span className="landing-audit-step-num" aria-hidden="true">
                3
              </span>
              <div className="landing-audit-step-body">
                <h3 className="landing-audit-step-title">Compte rendu</h3>
                <p className="landing-audit-step-text">
                  Formulation, structure, mots-clés et posture candidat : tu repars avec des actions
                  prioritaires et un retour rédigé dans l&apos;app après le rendez-vous.
                </p>
              </div>
            </li>
          </ol>
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
            <p className="landing-social-proof-trust">BUT info, école de commerce — alternance et stage</p>
            <h2 className="landing-section-title">Des retours concrets sur l&apos;accompagnement</h2>
          </div>
          <ul className="landing-testimonials">
            <li className="landing-testimonial">
              <div
                className="landing-testimonial-stars"
                aria-label="Note 5 sur 5"
                title="5 sur 5"
              >
                <span aria-hidden="true">★★★★★</span>
              </div>
              <blockquote className="landing-testimonial-quote">
                « En BUT informatique, je postulais au hasard. Les offres proposées collaient enfin
                au dev / data, et après un RDV d&apos;accompagnement j&apos;ai structuré mon CV et mes
                projets GitHub. Alternance signée chez un éditeur SaaS en un peu plus d&apos;un mois. »
              </blockquote>
              <p className="landing-testimonial-source">
                <span className="landing-testimonial-avatar" aria-hidden="true">
                  T
                </span>
                <span>
                  <strong className="landing-testimonial-name">Thomas L.</strong>
                  <span className="landing-testimonial-meta">BUT informatique</span>
                  <span className="landing-testimonial-via">Alternance signée</span>
                </span>
              </p>
            </li>
            <li className="landing-testimonial">
              <div
                className="landing-testimonial-stars"
                aria-label="Note 5 sur 5"
                title="5 sur 5"
              >
                <span aria-hidden="true">★★★★★</span>
              </div>
              <blockquote className="landing-testimonial-quote">
                « En école de commerce (M1), je cherchais un stage marketing. ARTEMSI m&apos;a évité
                les annonces hors sujet : offres ciblées, suivi des relances et retours concrets sur
                ma lettre. Stage de 6 mois en communication digitale, obtenu après plusieurs
                entretiens. »
              </blockquote>
              <p className="landing-testimonial-source">
                <span className="landing-testimonial-avatar" aria-hidden="true">
                  C
                </span>
                <span>
                  <strong className="landing-testimonial-name">Camille D.</strong>
                  <span className="landing-testimonial-meta">École de commerce</span>
                  <span className="landing-testimonial-via">Stage trouvé</span>
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
              <summary>Comment accéder à mon espace après le paiement ?</summary>
              <p>
                Après la souscription (Stripe), tu reçois un <strong>email avec un lien</strong> sur
                l&apos;adresse utilisée au paiement. Tu cliques, tu choisis ton mot de passe, puis tu
                complètes ton profil (école, métier visé, région, type de contrat). Ensuite : offres,
                suivi des candidatures et réservation d&apos;accompagnement. Pas reçu l&apos;email ? Vérifie
                les spams ou utilise la page d&apos;inscription secours avec le <strong>même email</strong> que
                sur Stripe.
              </p>
            </details>
            <details className="landing-faq-item">
              <summary>Je cherche une alternance ou un stage : ARTEMSI est fait pour moi ?</summary>
              <p>
                Oui. L&apos;outil s&apos;adapte à ton objectif dès l&apos;onboarding (alternance, stage, durée de
                contrat). Les offres et le matching tiennent compte de ton niveau (BUT informatique,
                école de commerce, licence, etc.) et de ta région — que tu vises la tech, le marketing,
                la finance ou un autre secteur.
              </p>
            </details>
            <details className="landing-faq-item">
              <summary>Comment fonctionnent les offres ciblées ?</summary>
              <p>
                Tu renseignes ton profil une fois : métier cible, régions, domaine d&apos;études, type de
                contrat. ARTEMSI te propose ensuite des offres filtrées et classées pour toi — environ{" "}
                <strong>10 nouvelles offres pertinentes par jour</strong>, avec un lien direct pour
                postuler. Tu gardes aussi un tableau de bord pour suivre ce que tu as envoyé, les
                relances et les réponses.
              </p>
            </details>
            <details className="landing-faq-item">
              <summary>En quoi ARTEMSI est différent d&apos;un job board classique ?</summary>
              <p>
                Sur un site d&apos;annonces, tu cherches et tu tries seul des centaines d&apos;offres. Ici,
                c&apos;est l&apos;inverse : les opportunités viennent à toi selon ton profil, avec un suivi
                intégré et un accompagnement humain (relecture CV / lettre, entretiens). L&apos;objectif
                n&apos;est pas de « voir plus d&apos;annonces », mais de <strong>postuler mieux et plus vite</strong>{" "}
                sur ce qui compte vraiment pour toi.
              </p>
            </details>
            <details className="landing-faq-item">
              <summary>Comment se déroule l&apos;accompagnement personnalisé ?</summary>
              <p>
                Depuis ton espace, tu réserves un créneau d&apos;<strong>1 h en direct</strong> avec un
                expert ARTEMSI. Il relit ton CV et ta lettre, vérifie la cohérence avec ton objectif
                (alternance ou stage) et te donne des actions concrètes pour tes prochaines
                candidatures. L&apos;équipe confirme le créneau (ou te propose un autre) ; un compte rendu
                est disponible dans l&apos;app après le rendez-vous. Ce n&apos;est pas une rédaction complète de
                documents à ta place.
              </p>
            </details>
            <details className="landing-faq-item">
              <summary>J&apos;ai payé mais je n&apos;arrive pas à me connecter</summary>
              <p>
                La connexion se fait avec l&apos;<strong>email du paiement</strong> et le mot de passe que tu
                as choisi via le lien reçu par email. Si tu n&apos;as pas encore créé de mot de passe, le
                login affichera « identifiants incorrects » : ouvre le lien dans ton email, ou passe par
                l&apos;inscription secours avec le même email que Stripe. Une fois connecté, pense à finir
                l&apos;onboarding pour débloquer les offres.
              </p>
            </details>
            <details className="landing-faq-item">
              <summary>Pourquoi pas d&apos;essai gratuit ?</summary>
              <p>
                Dès la souscription, le matching, les offres et le suivi sont actifs — ce sont des
                services réels, pas une démo limitée. Tu paies pour un gain de temps immédiat (tri,
                dossier, candidatures). Tu peux résilier selon les{" "}
                <Link href="/cgu">CGU</Link> ; la gestion de l&apos;abonnement se fait depuis ton profil
                (portail Stripe sécurisé).
              </p>
            </details>
            <details className="landing-faq-item">
              <summary>Combien de temps pour décrocher une alternance ou un stage ?</summary>
              <p>
                Il n&apos;y a pas de délai garanti : tout dépend de ton secteur, de ton niveau et du
                marché local. ARTEMSI accélère surtout les étapes où les candidats perdent le plus de
                temps — trouver les bonnes offres, structurer le CV, suivre les candidatures et
                préparer les entretiens. Plus ton profil est complet et plus tu postules régulièrement,
                plus tu maximises tes chances.
              </p>
            </details>
            <details className="landing-faq-item">
              <summary>Puis-je annuler mon abonnement ?</summary>
              <p>
                Oui, à tout moment depuis ton espace candidat (section profil → gestion
                d&apos;abonnement). Tu es redirigé vers le portail Stripe pour annuler ou mettre à jour ta
                facturation. L&apos;accès reste actif jusqu&apos;à la fin de la période déjà payée.
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
