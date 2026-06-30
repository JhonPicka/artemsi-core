# ARTEMSI Core

Plateforme candidats **alternance ingénieur / industrie** — Next.js 16 + Supabase.

---

> ## ⚠️ VERSION PC / TABLETTE — GELÉE, NE PAS MODIFIER
>
> La version desktop (≥ 768px) de la landing est **validée et définitive**.  
> **Aucune modification** ne doit être apportée à l'affichage PC/tablette (`page.tsx`, `globals.css`, composants `landing/`).  
> Toute future retouche doit cibler **uniquement le mobile (< 768px)** via un bloc `@media (max-width: 767px)`, sans toucher aux règles desktop existantes.  
Prod : [artemsi.fr](https://artemsi.fr) · Repo : `app/` · Design : [`docs/design-system.md`](docs/design-system.md)

> **Statut acquisition (juin 2026) :** produit **terminé** — stratégie validée : **2 bras uniquement** — (1) **cold B2B** chargés de recrutement / RH · (2) **TikTok** vidéos + réponses commentaires & DM **aux inscrits**. Pas d’ads, pas d’influenceurs, pas de BDE en masse pour l’instant — voir § *Stratégie A1*.

---

## 1. Mission & promesse

**ARTEMSI réduit le bruit pour remettre de la confiance dans le recrutement.**

Trois promesses : **offres ciblées** · **candidatures mieux préparées** · **suivi clair + progression** (profil, documents, audit).

Taglines : *« Moins de candidatures inutiles. Plus d'offres utiles. »* · *« ARTEMSI transforme le refus en progression. »*

**Message marketing (2026) :** *« Alternance ingénieur & industrie — gratuit pour organiser, Pro pour tout débloquer. »*

---

## 2. Modèle produit — Gratuit vs Pro

> **Prod (juin 2026) :** freemium **déployé** — inscription gratuite (`/signup`), dashboard sans carte, upgrade Pro depuis le compte (`/subscribe`) avec essai 7 jours au checkout.

| | **Gratuit** | **Pro — 19,90 € / mois** |
|---|-------------|--------------------------------|
| Promesse | Organiser sa recherche | Viser et être accompagné |
| Inscription | Email + MDP, **accès immédiat**, sans carte | Upgrade depuis le compte |
| Offres ciblées | Aperçu matching + **voir** les exclusives | Matching complet + **postuler** aux exclusives |
| Candidatures préparées | Profil + CV/LM | + guides candidat par offre |
| Suivi + progression | Dashboard candidatures | + **1 × 1 h / mois** audit humain |
| Jobboard (détail CGU) | **50 %** offres publiques moins récentes | **100 %** |
| Upgrade Pro | — | Carte + **essai 7 jours** |

**Onboarding :** 5 étapes actuelles (inchangé).

### Audits gratuits — offre promo (acquisition)

Le **mini-audit 10 min** est une **offre commerciale ponctuelle** (TikTok, campagnes, invitation), **pas** un droit attaché à tout compte Gratuit.

| Mode | Condition | Format |
|------|-----------|--------|
| **1:1 express** | Offre active + capacité ops | 10 min, personnalisé |
| **Live collectif** | Forte demande / opération | 45–60 min, Q&A + replay 48 h |

Règles ops : 1 session promo / compte éligible · fenêtre limitée si campagne · plafond solo **< 25 h audit / semaine** · copy honnête (*offre découverte*, pas *audit inclus pour tous*).

---

## 3. Vision — 4 segments de carrière (progressif)

ARTEMSI couvre **toute la carrière** par couches — un segment actif à la fois en com' publique.

| Segment | Âge | Besoin | Offre ARTEMSI | Monétisation |
|---------|-----|--------|---------------|--------------|
| **Étudiant** | 20–25 ans | Stage & alternance | Audit CV/LM · templates · coaching | **Gratuit + Pro 19,90 €** ← *focus A1* |
| **Junior** | 25–28 ans | 1er CDI post-école | Coaching entretien CDI · négo salaire | **Pro+ 29,90 €/mois** *(A2)* |
| **Confirmé** | 28–40 ans | Évolution & mobilité | Mentorat · réseau · mise en relation RH | **Career 49 €/mois** *(A3)* |
| **Senior** | 40+ ans | Poste de direction | Chasse de tête · data parcours rare | **Commission placement** *(2029+)* |

**Principe :** les users A1 (alternance à 21 ans) deviennent le vivier naturel des segments suivants — **données longitudinales = avantage compétitif** vs cabinets et jobboards.

**Focus immédiat (code + GTM) :** segment **Étudiant / alternance ingé-industrie** uniquement. Les autres tiers = roadmap produit & pricing, pas le scope session 1.

### Cercle vertueux B2B

Trafic gratuit → profils actifs + suivi → intérêt mesurable par métier/région → approche RH avec preuves → exclusives partenaires → produit Pro renforcé → **data parcours vendable** (A3).

### Cold B2B — chargés de recrutement & RH *(bras 1)*

> **Cible unique :** chargés de recrutement, responsables RH alternance / jeunes talents, recruteurs internes PME–ETI. **Pas** d’écoles / BDE en cold pour l’instant — le catalogue partenaire se construit via les RH.

**Pourquoi ce canal en premier** : peu de profils candidats au départ, mais des **preuves d’intérêt mesurables** par métier et région (`/admin/stats`, `/admin/candidats`) → argument concret pour décrocher des **offres partenaires exclusives**.

**Promesse B2B (1 phrase)**  
*« Moins de candidatures inutiles. Plus d'offres utiles. »* — ARTEMSI envoie vos alternances aux profils qui matchent (domaine, lieu, poste), pas à tout le marché.

**Pitch 30 secondes (appel / LinkedIn vocal)**  
ARTEMSI, c’est une plateforme alternance ingénierie & industrie. On a des candidats qui complètent leur profil, leur CV et leur suivi de candidatures chez nous. Quand vous publiez une offre partenaire, on la diffuse **uniquement** aux profils compatibles. Vous recevez moins de volume, mais des candidatures **plus alignées**.

**Routine cold B2B (30–45 min / jour)**
1. Identifier 5–10 **chargés de recrutement** / RH alternance sur LinkedIn (secteur industrie, ingé, tech, commerce selon ton catalogue).
2. Personnaliser le message ci-dessous avec chiffres réels (`/admin/offres/distribution`, `/admin/candidats`).
3. Relance J+3 si pas de réponse — max 2 relances.
4. Objectif : **1 partenaire / semaine** qui accepte une offre exclusive ou un call 15 min.

---

#### Message cold email / LinkedIn — chargé·e de recrutement / RH

> Copier-coller et personnaliser `[…]`.

```
Objet : Alternants [DOMAINE] — diffusion ciblée (ARTEMSI)

Bonjour [Prénom],

Je suis [Ton prénom], fondateur d’ARTEMSI (artemsi.fr) — plateforme dédiée à l’alternance ingénierie & industrie.

Nous accompagnons aujourd’hui [X] alternants actifs en [RÉGION / DOMAINE], avec profils structurés (école, domaine, poste visé, CV).

Contrairement à un jobboard classique, nous ne noyons pas vos annonces sous le bruit :
→ matching par domaine, région et poste recherché ;
→ candidatures mieux préparées (profil + suivi intégré) ;
→ possibilité d’**offre partenaire exclusive** avec guide candidat dédié.

Je cherche [1 / 2 / 3] partenaires pour publier des alternances [DOMAINE] en [RÉGION] ce mois-ci.

Seriez-vous ouvert à un échange de 15 minutes cette semaine ?

Bien à vous,
[Ton prénom]
ARTEMSI · artemsi.fr
```

---

#### Message court — DM LinkedIn / relance

```
Bonjour [Prénom] — je lance ARTEMSI, plateforme alternance ingé / industrie.
On a [X] profils actifs en [DOMAINE / RÉGION] et on diffuse les offres partenaires
uniquement aux candidats qui matchent (pas du volume inutile).
Ouvert à un call 15 min pour voir si une alternance chez [ENTREPRISE] peut partir en exclusif ?
```

---

**Avant chaque série de cold B2B**
1. Vérifier `/admin/offres/distribution` — savoir quels domaines/régions défendre en rendez-vous.
2. Avoir **2–3 offres partenaires** ou un slot « exclusif » à proposer (crédibilité).
3. Citer des **chiffres réels** : nb profils, domaines, régions (admin Stats / Candidats).

**Ne pas promettre en cold B2B** : volume massif de CV, placement garanti, audit inclus pour tous.

### TikTok — contenu + support inscrits *(bras 2)*

> **Uniquement** : publier des vidéos + répondre aux **commentaires** et **DM des personnes déjà inscrites** sur ARTEMSI. Pas de prospection froide en DM TikTok · pas de micro-influenceurs · pas d’ads pour l’instant.

**Rôle de TikTok** : notoriété + expliquer le produit **avant** l’inscription (vidéo tuto sur la landing + posts réguliers).

| Action | Fréquence | Détail |
|--------|----------|--------|
| **Vidéos** | 2–4 / semaine | Alternance, erreurs CV, démo ARTEMSI, coulisses — lien bio → artemsi.fr |
| **Commentaires** | Quotidien | Répondre à toutes les questions · orienter vers inscription gratuite si pas encore inscrit |
| **DM** | Quotidien | **Priorité aux inscrits** : aide onboarding, offres, upgrade Pro — vérifier email / compte si besoin |
| **Vidéo tuto landing** | Une fois (J0) | `NEXT_PUBLIC_LANDING_DEMO_VIDEO_URL` + repost sur `@artemsiapp` |

**Ne pas faire sur TikTok (phase actuelle)** : spam DM froids · promesse audit gratuit pour tous · lives massifs sans capacité ops · budget pub Meta/TikTok.

**Mini-audit 10 min** : offre promo **ponctuelle** en commentaire/live si tu l’annonces — pas un droit automatique pour tous les comptes gratuits.

---

## 4. Roadmap 3 ans — jalons produit & business

### A1 — An 1 · Fondation alternance *(juin 2026 → juin 2027)*

**Segment :** étudiant uniquement · **ICP :** alternance ingé / industrie · com' IDF puis expansion.

| Pilier | Contenu |
|--------|---------|
| **Produit** | Freemium sans carte · gating Gratuit/Pro · 5–15 offres exclusives B2B |
| **Acquisition** | **Cold B2B RH** + **TikTok** (vidéos + support inscrits) |
| **Ambition** | Référence alternance Île-de-France |

| KPI fin A1 | Cible |
|------------|-------|
| Users gratuits | **1 500–2 000** |
| Pro payants | **150–200** |
| MRR | **~3 500 €** |
| Entreprises B2B | **25–40** |

**Jalons intermédiaires (pic rentrée sept. 2026) :** 250–350 Pro = stretch ops · 50–80 actifs fin juillet · freemium live d'abord.

**Ne pas faire en A1 :** stage / job / junior sur la landing · CAC40 sans vivier · tiers Pro+ / Career.

### A2 — An 2 · Stage + 1er emploi *(juil. 2027 → juin 2028)*

**Segments :** étudiant + **junior** — les users 2026 cherchent leur CDI : ARTEMSI les retient.

| Pilier | Contenu |
|--------|---------|
| **Produit** | Offres stage · premier emploi CDI · **tier Pro+ 29,90 €** · app mobile |
| **Équipe** | 1 dev front/back recruté |
| **B2B** | Partenariats **50+ écoles** · data parcours disponible |

| KPI fin A2 | Cible |
|------------|-------|
| Users actifs | **6 000–8 000** |
| Payants (tous tiers) | **600–800** |
| MRR | **15 000–20 000 €** |
| Tiers actifs | Gratuit / Pro / Pro+ |

### A3 — An 3 · Plateforme carrière *(juil. 2028 → juin 2029)*

**Segments :** tous actifs · lancement **confirmé** (mentorat, mise en relation RH).

| Pilier | Contenu |
|--------|---------|
| **Produit** | Tier **Career 49 €** · data longitudinale 3 ans · B2B écoles & DRH |
| **Business** | Levée Série A **ou** rentabilité solide · expansion nationale |
| **Équipe** | **8–12 personnes** |

| KPI fin A3 | Cible |
|------------|-------|
| Users | **25 000–40 000** |
| Payants | **3 000–5 000** |
| MRR | **80 000–120 000 €** |
| ARR | **> 1 M€** possible |

### Horizon 5 ans — Senior *(2029+)*

Commission placement cadres / dirigeants (**3–8 %** du salaire) · users entrés à 21 ans = 26–28 ans en management · **5 ans de data parcours** · barrière à l'entrée très haute pour les concurrents.

---

## 5. Go-to-market A1 (exécution immédiate)

### Stratégie validée — juin 2026

**Deux bras, rien d’autre pour l’instant :**

```
Bras 1 — Cold B2B          Bras 2 — TikTok
Chargés recrutement / RH    Vidéos 2–4 / semaine
LinkedIn + email             Commentaires + DM inscrits
→ offres partenaires         → notoriété + rétention
```

| Bras | Cible | Actions | Objectif |
|------|-------|---------|----------|
| **1 — B2B** | Chargé·e de recrutement, RH alternance | 5–10 messages/jour · relances · calls 15 min | 1 partenaire / semaine · offres exclusives |
| **2 — TikTok** | Candidats (audience) + **inscrits** (support) | Posts · réponses commentaires · DM inscrits | Inscriptions + onboarding fini + rétention J+7 |

**Hors scope immédiat** : ads Meta/TikTok · micro-influenceurs · cold BDE / écoles · groupes Facebook/Discord · parrainage `?ref=` (session 3+).

**Routine hebdo (≈ 1 h / jour)**

| Jour | B2B (30–45 min) | TikTok (30 min) | Admin (15 min) |
|------|-----------------|-----------------|----------------|
| Lun–Ven | 5–10 messages RH + 2 relances | 1 post ou réponses commentaires/DM inscrits | Valider import LBA (`/admin/offres/import`) · taguer offres · Distribution |
| Mer | Préparer call partenaire | Vidéo courte si possible | Matching manuel |
| Ven | Bilan : partenaires · pipeline RH | Stats inscriptions (`/admin/stats`) | — |

### Lancement — config & vidéo tuto

**Principe :** la vidéo explique le produit *avant* l’inscription → l’onboarding 5 étapes n’est plus une surprise quand quelqu’un arrive depuis TikTok.

| Étape | Action |
|-------|--------|
| **J0** | Publier la **vidéo explicative** (~2 min) sur **TikTok** (`@artemsiapp`) + **landing** (`NEXT_PUBLIC_LANDING_DEMO_VIDEO_URL`) |
| **Continu** | Bras 1 + Bras 2 selon routine ci-dessus · alimenter le catalogue (tag `study_domain` + matching) |

**Vidéo landing — config prod (Vercel) :**
- `NEXT_PUBLIC_LANDING_DEMO_VIDEO_URL` — URL YouTube, Vimeo ou fichier `.mp4`
- `NEXT_PUBLIC_TIKTOK_TUTORIAL_URL` — lien post TikTok tutoriel (CTA hero optionnel)

### Signaux à suivre (sans ads pour l’instant)

KPI hebdo dans `/admin` et `/admin/stats` :

| Signal | Seuil indicatif | Action si bas |
|--------|-----------------|---------------|
| Inscriptions | Croissance semaine / semaine | Plus de posts TikTok · meilleur CTA bio |
| Onboarding terminé | ≥ 50 % des inscrits | DM inscrits bloqués · simplifier message |
| 1ère valeur (offre / candidature) | ≥ 30 % des onboardés | Taguer + matcher le catalogue |
| Partenaires B2B | ≥ 1 / semaine | Plus de cold RH · affiner pitch |
| Support TikTok | Réponse < 24 h aux inscrits | Prioriser DM comptes créés |

**Ads** : reportées tant que la stratégie 2 bras n’a pas produit des signaux stables (inscriptions + partenaires + rétention J+7). Cf. garde-fous ci-dessous si reprise plus tard.

### Funnel (avec offre promo audit)

```
Visiteurs → Inscrits gratuits (11–12 %) → Actifs (40 %) → Pro (10–12 % / 3 mois)
→ conversion globale ~0,45–0,50 %
```

L’audit 10 min peut **accélérer** la conversion quand il est proposé en opération — ce n’est pas une étape obligatoire du parcours Gratuit.

| Objectif | Pro | Inscrits gratuits | Visiteurs (juin–sept.) |
|----------|-----|-------------------|------------------------|
| Ops fin sept. 2026 | **250–350** (stretch) | ~9 000 | ~62 000 |
| **Fin A1 (juin 2027)** | **150–200** | **1 500–2 000** | — |
| Cap stretch | 500–700 | ~15 000 | ~100 000 (+ pub) |

### KPI paliers

| Date | Actifs gratuits | Pro cumulés |
|------|-----------------|-------------|
| +14 j post-freemium | 10–20 | 5–15 |
| Fin juillet | 50–80 | 15–30 |
| Fin août | 150–250 | 50–100 |
| **Fin septembre** | — | **250–350** (ops) |

**North-star court terme :** profils complétés + usage J+7 + conversion Gratuit → Pro.  
**North-star moyen terme :** upgrades Pro + MRR (~19,37 € net / abonné après Stripe).

### Catalogue offres

1. **Volume automatisé** — import quotidien **La Bonne Alternance** (API [api.apprentissage.beta.gouv.fr](https://api.apprentissage.beta.gouv.fr)) : recherche par région + codes ROME des profils onboardés, filtre **sites carrière uniquement** (France Travail, Indeed, HelloWork exclus), matching profil obligatoire, dédup `external_key`. Validation admin chaque matin sur `/admin/offres/import` avant le cron 5h UTC.
2. **Volume manuel** — import CSV admin (`/admin/offres/import`) ou saisie URL + IA (`/admin/offres/nouvelle`).
3. **Qualité** — 5–10 offres / semaine manuelles (URL officielles, exclusives partenaires, guide IA).
4. **Priorité** — top 20–40 URLs ICP en complément du flux LBA.
5. **Promesse honnête** — *offres sélectionnées et ciblées*, pas *100 % sources officielles* — le filtre LBA exclut les jobboards agrégateurs.

### Garde-fous

Remboursements > 10 % → revoir promesse / offres · Activation < 25 % → revoir onboarding ou vidéo tuto · **Pas d’ads** tant que stratégie 2 bras non validée · Si reprise ads plus tard : CAC cible < 25 € · couper si CAC > 40 € sur 3 jours.

---

## 6. État produit

### Livré en prod (juin 2026)

**Compte & billing**
- Auth email/MDP · onboarding 5 étapes · profil · upload CV/LM (Supabase Storage)
- **Freemium** : compte gratuit sans carte (`/signup`) · dashboard accessible (`requireActiveSubscription` ne bloque plus les gratuits)
- **Pro** : `userHasProAccess` (abonnement actif) · checkout `/subscribe` · essai **7 j** (`BILLING_TRIAL_DAYS`) · webhook Stripe
- Pages légales (CGU alignées Gratuit/Pro) · thème dark premium · mobile-first

**Dashboard candidat**
- **Offres** : onglets *Pour moi* · *Partenaires* · *Jobboard* (recherche, filtre source, pagination 24/page)
- Gating gratuit : jobboard **50 % moins récentes** · exclusives visibles mais **non postulables** · guide candidat masqué · audit réservé **Pro** (mini-audit 10 min = offre promo hors produit)
- Clic offre → **nouvel onglet** (URL officielle) · boutons Candidater + **Signaler un lien mort**
- Candidatures · KPI dashboard · notifications in-app

**Qualité catalogue offres**
- Signalement lien mort (`POST /api/offers/link-report`) · **3 signalements** → offre **masquée** auto (`hidden_at`, retirée du jobboard)
- Admin : corriger l’URL (réactive l’offre + efface les signalements) ou **supprimer** l’offre (`DELETE /api/admin/offers/[id]`)

**Admin**
- `/admin` : **pilotage acquisition** — Gratuit vs Pro, MRR, conversion, churn, remboursements Stripe (90 j), funnel inscriptions → onboarding → candidatures → Pro, tendances 14 j, catalogue (masquées, signalements)
- `/admin/offres` : sous-pages **Toutes les offres** · **Nouvelle offre** (scan URL ou saisie manuelle) · **Import** (LBA + CSV) · **Distribution** · **Matching** (manuel)
- `/admin/offres/import` : **import La Bonne Alternance** (API) + validation quotidienne du cron + import CSV en masse
- Chaque offre a un **tag `study_domain`** (mêmes codes que le profil candidat : INFORMATIQUE, MARKETING, …) — obligatoire à la création, suggéré par l’IA à l’extraction
- `/admin/offres/distribution` : courbe de demande (profils par domaine) + comparatif offres — voir § pilotage catalogue ci-dessous
- `/admin/audit` : validation demandes · notifications via `ADMIN_USER_ID`

**Pilotage catalogue (règle ops)**
- **Objectif :** le catalogue doit **suivre la distribution des profils** — viser une majorité d’offres dans les domaines où tu as le plus de candidats (écart cible ≈ ±5 pts entre % profils et % offres par domaine).
- **Outil :** onglet admin **Distribution** — liste « à enrichir en priorité » + graphiques profils vs offres.
- **Rituel quotidien :** 1–2 offres dans le domaine le plus sous-représenté, puis matching manuel quand le lot est prêt.
- **Migration :** `20260624140000_offers_study_domain.sql` (colonne `offers.study_domain`).

**Offres & matching**
- Catalogue alimenté par **import LBA quotidien** (sites carrière) + CSV / formulaire admin · intérêts jobboard (`offer_interests`)
- **La Bonne Alternance** *(livré juin 2026)* : client API (`lba-client.ts`) · mapping domaine → codes ROME (`lba-rome-mapping.ts`) · géopoints région (`region-geopoints.ts`) · dédup `external_key` + URL · import manuel admin ou cron automatique après validation matinale
- Matching **manuel** (onglet admin Matching ou case à cocher à la publication) · matching **nouveau profil** à la fin de l’onboarding · matching auto après chaque import LBA
- Filtre domaine : si l’offre est taguée, seuls les profils du **même domaine** (ou domaine AUTRE / offre AUTRE) sont éligibles — puis score titre / région / contrat
- Audits Pro : créneaux **10h–16h** semaine, **10h–14h** week-end (Paris)

**Infra prod (validée juin 2026)**
- Migrations Supabase **26/26** appliquées (dont `offers_lba_import`, `lba_import_daily_decision`) · RLS · Storage `user-documents`
- Vercel : `ADMIN_USER_ID` (notifs signalements + audits) · env Supabase / Stripe / Resend / **`LBA_API_TOKEN`**
- Crons Vercel : `offers-import` (5h UTC — LBA + matching) · `offers-daily-assign` (6h30 UTC — 5 offres/jour Pro)
- Stripe webhook : `https://artemsi.fr/api/stripe/webhook`
- Supabase Auth : redirect URLs `artemsi.fr` + callbacks OK
- **Prêt acquisition** : freemium · matching · signalements lien mort · cap 2 offres gratuites · **import LBA opérationnel**

**Vidéo tuto (à brancher J0 lancement)**
- Composant `LandingAppVideo` — active dès que `NEXT_PUBLIC_LANDING_DEMO_VIDEO_URL` est renseigné en prod
- Lien TikTok tutoriel : `NEXT_PUBLIC_TIKTOK_TUTORIAL_URL` (optionnel, CTA dans `landing-tiktok-reviews.ts`)

### Mises à jour landing — juin 2026

**Parité PC & tablette (règle fixe)**

- **≥ 768px (tablette + PC)** : même design, mêmes proportions, même structure — pas de layout différent entre iPad et grand écran.
- **< 768px (mobile)** : ajustements différés ; ne pas bloquer les changements desktop/tablette pour le phone.
- **Breakpoint unique landing : `768px`** — éviter les media queries intermédiaires (900px, 1024px…) sur les sections landing.
- Règle Cursor persistante : [`.cursor/rules/landing-responsive-pc-tablet.mdc`](.cursor/rules/landing-responsive-pc-tablet.mdc)

**Design & layout hero**
- Layout hero desktop/tablette unifié : breakpoint unique **768px** (photo TikTok + 2 colonnes + carousel)
- Photo profil TikTok : taille contrainte (`max-height: 460px`), colonne droite réduite (`2.4fr / 0.75fr`), bords arrondis sur les commentaires carousel
- Texte gauche : `justify-content: flex-start`, espacement interne revu (badge, titre, sous-titre, CTA)
- Sous-titre libéré (plus de justification forcée, `text-align: left`, `max-width: 41ch`)
- Carousel commentaires : `margin-top: 5rem` desktop, bords arrondis (`border-radius: 0.75rem`)
- Script de thème migré de `<script>` natif vers `<Script strategy="beforeInteractive">` Next.js (supprime l'avertissement React 19)

**Structure de la landing (nouvel ordre)**
1. Hero (photo TikTok + texte + carousel avis)
2. **3 étapes** pour décrocher ton alternance
3. **App preview** (l'espace que tu utilises au quotidien)
4. **Rendez-vous d'1 h** — accompagnement personnalisé
5. **Tarifs** (plan compare)
6. **FAQ**
7. CTA final + footer

**CSS nettoyé**
- Suppression CSS mort : `.landing-hero-inner`, `.landing-hero-tiktok` (composant non monté), `.landing-hero-left .landing-hero-carousel-wrap`
- `sizes` images TSX alignés avec le breakpoint CSS (960px → 768px)
- Gap `.landing-hero-left` fixe à desktop (suppression `clamp()`)

### Prod vs cible (écarts restants)

| Élément | Prod actuelle | Cible / backlog |
|---------|---------------|-----------------|
| Entrée gratuite | `/signup` (CTA landing + formulaire) · comparatif tarifs sur `/#landing-prix` | OK |
| Paywall dashboard | **Retiré** (gratuit OK) | OK |
| Essai Pro 7 j | Au checkout upgrade connecté | OK |
| Jobboard gratuit | **50 % moins récentes** | OK (aligné CGU) |
| Offres assignées gratuites | **Max 2** dans « Pour moi » (matching limité) | Matching complet |
| Audit gratuit 10 min | **Offre promo** (pas dans le socle Gratuit) · page audit = Pro | Ops / campagnes selon dispo |
| Guide candidat | Masqué si gratuit | OK |
| Parrainage `?ref=` | — | Session 3+ |
| Emails nurture J+3/J+7 | — | Session 3+ |
| Tutoriel onboarding 3 étapes | — | Session 3+ |

---

## 7. Chantiers code

### ✅ Session 1 — core freemium *(livré)*

1. ~~Signup gratuit~~ → `/signup` (route unique ; `/signup/gratuit` redirige)
2. ~~Retirer paywall dashboard~~
3. ~~Gating~~ : 50 % moins récentes · exclusives non postulables · guide masqué
4. ~~Checkout Pro depuis compte~~ · `trial_period_days: 7`
5. Landing + CGU · CTA « Commencer gratuitement » · `billing-offer.ts`

### ✅ Qualité offres *(livré juin 2026)*

6. Signalement lien mort · masquage auto à 3 · admin corriger/supprimer
7. Ouverture offre en nouvel onglet · onglets Pour moi / Partenaires / Jobboard

### ✅ Import La Bonne Alternance *(livré juin 2026)*

8. Client API LBA (`/api/job/v1/search`) · jeton `LBA_API_TOKEN`
9. Filtres : sites carrière uniquement · exclusion jobboards (France Travail, Indeed, HelloWork…) · matching profil obligatoire · dédup `external_key`
10. Admin `/admin/offres/import` : validation quotidienne cron + import manuel (profil admin ou tous les profils) + matching optionnel
11. Cron `GET /api/cron/offers-import` (5h UTC) — uniquement si « Oui, importer ce matin » validé

### Session 2 — audits Pro *(livré)* + promos *(ops)*

12. Audits Pro 1 h (créneaux, plafond 3/mois) — **livré**
13. Mini-audit 10 min : **offre promo ponctuelle** (TikTok, invitation) — pas de dev produit obligatoire

### 🚀 Session acquisition — en cours (juin 2026)

14. **Stratégie 2 bras** : cold B2B chargés recrutement / RH · TikTok vidéos + commentaires/DM inscrits
15. **Vidéo tuto** landing + TikTok *(J0)* · pas d’ads / influenceurs pour l’instant
16. Analytics funnel · Sentry — souhaitable, pas bloquant pour démarrer

### Session 3+ — croissance

17. Parrainage `?ref=` · emails J+3/J+7 · tutoriel in-app 3 étapes · UI notifications candidat

---

## 8. Technique & démarrage local

**Stack :** Next.js 16 · React 19 · Supabase (auth, DB, storage) · Stripe · Resend  
**Proxy session :** `app/src/proxy.ts` · **UI tokens :** `app/src/app/globals.css`

### Structure

```
app/src/app/          pages + API routes
app/src/components/   UI
app/src/lib/          métier (billing, matching, offers, lba-client, lba-import…)
supabase/migrations/  SQL + RLS
docs/                 design-system, checklist MVP, plan croissance
```

### Setup rapide

```bash
cd app && npm install
# créer app/.env.local avec les variables ci-dessous (Supabase + Stripe, Resend si besoin)
npm run dev                  # http://localhost:3000
```

**Env minimum :** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
**Recommandé :** `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ADMIN_EMAIL`, `ADMIN_USER_ID`, `NEXT_PUBLIC_APP_URL`  
**Stripe :** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`  
**Acquisition (landing + TikTok) :** `NEXT_PUBLIC_LANDING_DEMO_VIDEO_URL`, `NEXT_PUBLIC_TIKTOK_TUTORIAL_URL`, `NEXT_PUBLIC_TIKTOK_URL`, `NEXT_PUBLIC_TIKTOK_HANDLE`  
**Matching & import LBA :** `CRON_SECRET`, `LBA_API_TOKEN` (jeton [api.apprentissage.beta.gouv.fr](https://api.apprentissage.beta.gouv.fr)) · optionnel : `LBA_API_BASE_URL`, `LBA_SEARCH_RADIUS_KM` (50), `LBA_SEARCH_LIMIT` (150)  
**Local sans gating :** `BILLING_ENFORCEMENT=false` dans `.env.local`

**Test import LBA en local :**
```bash
cd app && node scripts/test-lba-import.mjs   # vérifie le jeton + une recherche API
```

### Migrations Supabase

Exécuter **dans l'ordre chronologique** tous les fichiers `supabase/migrations/*.sql` (Supabase CLI `db push` ou SQL Editor).

| Migration | Rôle |
|-----------|------|
| `20260425170000_init_auth_profile_onboarding` | Auth, profils, onboarding |
| `20260425180000_add_offers_module` | Offres + assignations |
| `20260425190000_offers_jobboard` | `is_public`, jobboard |
| `20260425200000_applications` | Suivi candidatures |
| `20260425210000_audit_bookings` | Réservations audit |
| `20260428080000_profile_extra_fields` | Champs profil |
| `20260428174500_billing_gating` | Billing customers |
| `20260520120000_account_deletion_feedback` | Suppression compte |
| `20260520200000_offer_interests` | Intérêts jobboard |
| `20260526140500_offers_default_source_autre` | Source `autre` par défaut |
| `20260526190000_offers_max_applicants` | Plafond candidats offre |
| `20260526200000_applications_offer_link` | Lien candidature ↔ offre |
| `20260526210000_offer_keywords_application_cv` | Mots-clés + CV candidature |
| `20260526223000_applications_cover_letter` | LM candidatures |
| `20260526230000_profiles_billing_guard_and_application_dedup` | Billing guard + dédup |
| `20260528125000_rate_limits` | Rate limiting API |
| `20260607220000_onboarding_extended_fields` | Onboarding étendu |
| `20260610120000_offers_application_guide` | Guide candidat par offre |
| `20260613120000_application_guide_simplify` | Simplification guide JSON |
| `20260623120000_offer_link_reports` | Signalements lien mort |
| `20260623130000_offer_dead_link_hiding` | Masquage auto (`hidden_at`) + RLS |
| `20260624120000_user_activity_events` | Événements activité utilisateur |
| `20260624140000_offers_study_domain` | Tag domaine sur offres |
| `20260625120000_offers_exclusive_url_nullable` | URL nullable offres exclusives |
| `20260629120000_offers_lba_import` | `external_key` dédup import LBA |
| `20260630120000_lba_import_daily_decision` | Validation admin quotidienne import LBA |

### API principales

| Route | Rôle |
|-------|------|
| `POST /api/profile` | Profil + trigger matching onboarding |
| `POST /api/applications` | Candidatures (gating offre gratuit/Pro) |
| `POST /api/audit/bookings` | Réservation audit (**Pro**) |
| `POST /api/stripe/checkout` | Checkout Pro (user connecté) |
| `POST /api/stripe/webhook` | Events Stripe |
| `POST /api/offers/match` | Re-match manuel catalogue récent (secours ops, Bearer `CRON_SECRET`) |
| `GET /api/cron/offers-import` | Cron Vercel : import LBA (sites carrière) + matching catalogue |
| `GET /api/cron/offers-daily-assign` | Cron Vercel : jusqu'à 5 offres « Pour moi » / jour / abonné Pro |
| `POST /api/offers/interests` | Intérêt jobboard |
| `POST /api/offers/link-report` | Signalement lien mort |
| `POST /api/admin/offers/import` | Import CSV |
| `POST /api/admin/offers/lba-import` | Import manuel LBA (admin) + matching optionnel |
| `GET/POST /api/admin/offers/lba-import/decision` | Validation quotidienne import LBA automatique |
| `PATCH /api/admin/offers/[id]` | Édition offre (+ réactivation si URL corrigée) |
| `DELETE /api/admin/offers/[id]` | Suppression offre |

**Stripe prod :** webhook → `https://artemsi.fr/api/stripe/webhook`  
**Dev :** URLs retour checkout résolues sur localhost via `resolveAppBaseUrl()` dans `lib/stripe.ts`.

### Offres & matching

- Import CSV ou formulaire admin (URL + IA) → matching des **nouvelles offres** → `offer_assignments`

#### Import La Bonne Alternance *(opérationnel)*

| Étape | Détail |
|-------|--------|
| **API** | `GET /api/job/v1/search` sur [api.apprentissage.beta.gouv.fr](https://api.apprentissage.beta.gouv.fr) — auth Bearer `LBA_API_TOKEN` |
| **Recherche** | Géopoint par région profil (`region-geopoints.ts`) + codes ROME par domaine d'étude (`lba-rome-mapping.ts`) · rayon `LBA_SEARCH_RADIUS_KM` (défaut 50 km) · limite `LBA_SEARCH_LIMIT` (défaut 150) |
| **Filtres** | Exclut jobboards (France Travail, Indeed, HelloWork, LinkedIn…) · exclut fiches recruteur LBA · **garde uniquement les sites carrière employeur** · offre doit matcher au moins 1 profil onboardé (domaine, région, poste) |
| **Dédup** | `external_key` (`lba:partner:url_normalisée`) + URL candidature normalisée (UTM ignorés) |
| **Admin** | `/admin/offres/import` — import manuel (profil admin ou tous les profils) + case matching · validation quotidienne « Oui, importer ce matin » |
| **Cron** | `GET /api/cron/offers-import` (5h UTC ≈ 6h–7h Paris) — import LBA + matching, **uniquement si validé ce matin** |
| **Scripts ops** | `app/scripts/test-lba-import.mjs` · `app/scripts/cleanup-lba-offer-duplicates.mjs` |

- **Assignation quotidienne Pro** (cron `offers-daily-assign`, 6h30 UTC) : max **5** nouvelles offres / jour civil (Paris) / abonné Pro dans « Pour moi »
- Champs clés : `is_public`, `is_partner_exclusive`, `source`, `hidden_at`, `external_key`
- **Lien mort :** 3 signalements distincts → `hidden_at` + `is_public = false` · admin corrige URL ou supprime

---

## 9. Docs complémentaires

| Fichier | Contenu |
|---------|---------|
| [`docs/design-system.md`](docs/design-system.md) | UI — **lire avant tout changement visuel** |
| [`docs/auth-profile-onboarding.md`](docs/auth-profile-onboarding.md) | Auth, profil, onboarding, gating freemium |
| [`docs/plan-croissance-artemsi-2026.md`](docs/plan-croissance-artemsi-2026.md) | Plan croissance détaillé, KPIs hebdo |
| [`docs/README_CHECKLIST_MVP_200_USERS.md`](docs/README_CHECKLIST_MVP_200_USERS.md) | Checklist pré-lancement |
| [`docs/STRIPE_SETUP.md`](docs/STRIPE_SETUP.md) | Config Stripe |

---

---

## BONUS — Projection revenus & leviers futurs (juin–oct. 2026)

*Établi le 21 juin 2026 — base de réflexion, pas une garantie. **Stratégie active = §5 (2 bras).** Le reste = options si scale plus tard.*

### Gains potentiels juin → octobre 2026

**Prix : 19,90 € TTC/mois → ~19,37 € net après Stripe**

#### Scénario réaliste (300–500 Pro)

| Mois | Pro cumulés | MRR estimé |
|------|-------------|-----------|
| Juillet | 20–40 | ~700 € |
| Août | 60–100 | ~1 800 € |
| Septembre | 150–250 | ~4 300 € |
| Octobre | 300–500 | **~8 000 €** |

**Total encaissé : ~8 000–15 000 €**
→ Valide le modèle, permet de recruter ou de lever.

#### Scénario optimiste (1 000–2 000 Pro)

| Mois | Pro cumulés | MRR estimé |
|------|-------------|-----------|
| Juillet | 50–80 | ~1 400 € |
| Août | 200–350 | ~5 800 € |
| Septembre | 500–800 | ~13 000 € |
| Octobre | 1 000–2 000 | **~25 000–38 000 €** |

**Total encaissé : ~30 000–60 000 €**
→ Recrute 1–2 personnes, accélère B2B et pub.

#### Scénario viral (5 000–10 000 Pro)

| Octobre MRR | ~100 000–190 000 € |
|---|---|
| Total encaissé | ~150 000–300 000 € |

→ Quitte tout le reste, équipe complète, vise série A.

---

### Organic — comment atteindre 1 000 payants en septembre

**Levier principal : TikTok / Instagram**
- 1 vidéo/jour minimum (avant/après CV, erreurs candidature, coulisses ARTEMSI)
- 1 vidéo virale à 500k+ vues peut générer 2 000–5 000 inscrits en 48h
- Lives Q&A avec des candidats en galère

**Communautés à cibler**
- Groupes Facebook alternance ingénieur (10k–50k membres)
- Serveurs Discord BDE grandes écoles
- Reddit r/france, r/emploi
- LinkedIn — posts sur la recherche d'alternance ingé

**Partenariats BDE** *(levier sous-estimé)*
- 1 accord avec un BDE = 500–2 000 inscriptions potentielles
- Contacter 20 BDE avant la rentrée septembre
- Pic d'activité BDE = août–septembre

**Audit gratuit comme moteur d'acquisition**
- Offrir publiquement sur TikTok "je relis ton CV en 10 min gratis"
- Les gens s'inscrivent pour réserver → conversion naturelle vers Pro

---

### Organic — comment atteindre 10 000 payants en septembre 2027

**Phase 1 (juil.–déc. 2026) — Prouver le modèle**
- 150–300 Pro, data de conversion réelle, 3–5 témoignages vidéo
- NPS > 50, rétention mois 2 > 60 %

**Phase 2 (jan.–juin 2027) — Passer à l'échelle**
- Parrainage : 1 mois gratuit pour chaque ami invité
- 2–3 créateurs TikTok/LinkedIn spécialisés alternance (100k+ abonnés) en affiliation (commission 20–30 %)
- SEO : articles "alternance ingénieur [ville]"
- Email nurture J+1/J+3/J+7 pour convertir gratuits en Pro

**Phase 3 (juil.–sept. 2027) — Pic rentrée**
- Pub Meta/TikTok sur audiences chaudes (CAC ciblé < 20 €)
- Partenariats officiels 5–10 grandes écoles d'ingé
- PR : Siècle Digital, Figaro Étudiant, presse étudiante

---

### Condition sine qua non

> **Le produit doit convertir.** Si le dashboard ne montre pas de valeur en 5 minutes, aucune acquisition ne fonctionne. Le freemium est **en prod** — **acquisition lancée**.

**Priorité immédiate (juin 2026) — stratégie 2 bras :**
1. **Cold B2B** : 5–10 messages / jour vers chargés de recrutement / RH (templates §3)
2. **TikTok** : vidéo tuto sur landing + posts réguliers · répondre commentaires & **DM inscrits**
3. **Catalogue** : valider import LBA chaque matin + taguer offres (`/admin/offres/distribution`) + matching pour que les inscrits voient de la valeur
4. **Tracker 5 chiffres / semaine** : inscrits, onboardings finis, 1ère offre/candidature, partenaires B2B, rétention J+7
5. Mini-audit 10 min = **offre promo ponctuelle** uniquement (pas promesse landing)

---

## Historique rapide

| | 2025 (v1) | Prod juin 2026 |
|---|-----------|----------------|
| Entrée | Gratuit sans carte | **Gratuit** (`/signup`) + upgrade Pro |
| Jobboard | Complet | 50 % moins récentes (gratuit) · 100 % Pro |
| Offres | — | Signalement lien mort · masquage à 3 · admin corrige/supprime · **import LBA quotidien** (sites carrière) |
| Humain | Aucun | Audits 1 h Pro · mini-audit 10 min = **offre promo**, pas droit Gratuit |
| Monétisation | Faible | Freemium live · Stripe Pro · essai 7 j |
