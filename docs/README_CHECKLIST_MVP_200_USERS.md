# README - Checklist MVP & 200 clients

Checklist operationnelle pour lancer le MVP ARTEMSI de facon securisee
et atteindre 200 clients payants.

---

## 1) Objectif et definition de succes

- [ ] Objectif principal valide: 200 **clients payants** (pas 200 comptes).
- [ ] Periode cible fixee (30 jours, 45 jours ou 90 jours).
- [ ] KPI north-star choisi: `paiements/jour`.
- [ ] KPI secondaires valides: conversion checkout, activation J1, retention J7, taux remboursement.
- [ ] Seuil de rentabilite clarifie (cout acquisition max acceptable).

## 2) Offre, prix, promesse

- [ ] Offre principale unique mise en avant (**19,90 EUR / mois** — un seul plan).
- [ ] Promesse marketing ecrite en 1 phrase simple et mesurable.
- [ ] Liste exacte de ce qui est inclus / non inclus dans l'abonnement.
- [ ] Promesse marketing (ex. entretiens / delais) nuancee et alignee landing + checkout + support.
- [ ] Motifs de remboursement acceptes/refuses definis.
- [ ] Regles de communication (pas de promesse non tenable) valides.

## 3) Positionnement et cible

- [ ] ICP prioritaire ecrit (niveau d'etude, filiere, zone geographique).
- [ ] Segment principal de lancement choisi (1 segment max au depart).
- [ ] Problemes prioritaires confirmes (offres, CV, suivi candidatures, audit).
- [ ] Message adapte au segment principal (landing + reseaux).
- [ ] FAQ objections listee (prix, delai, remboursement, preuve de valeur).

## 4) Securite et acces payant (bloquant lancement)

### 4.1 Gating abonnement (freemium — juin 2026)
- [x] Compte gratuit : acces dashboard sans carte (`/signup`).
- [x] Gating Pro : `userHasProAccess` (jobboard complet, partenaires, audit, guide).
- [x] Stripe webhook source de verite pour activer/desactiver Pro.
- [x] Upgrade depuis `/subscribe` (user connecte) + essai 7 jours.
- [x] Mini-audit 10 min = **offre promo** (pas un droit Gratuit — pas de dev produit requis).
- [x] Cap 1–2 offres assignees gratuites (`FREE_TIER_ASSIGNMENT_CAP = 2`).

### 4.2 Auth et anti-abus
- [ ] Confirmation email activee en prod.
- [ ] CAPTCHA sur signup/login active.
- [ ] Rate limiting sur `/api/*` sensibles active.
- [ ] Reponses erreur auth neutres (pas de fuite d'info).
- [ ] Politique mot de passe validee.

### 4.3 Donnees sensibles (CV/LM)
- [ ] Bucket `user-documents` prive confirme.
- [ ] Policies storage verifiees user par user.
- [ ] Signed URLs temporaires (TTL court) verifiees.
- [ ] Types fichiers et taille limites verifies.
- [ ] Test croise: user A ne peut pas lire user B.

### 4.4 Secrets
- [ ] Aucune cle sensible exposee en `NEXT_PUBLIC_*`.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` uniquement server-side.
- [ ] `.env.local` ignore par git confirme.
- [ ] Rotation des cles planifiee (Stripe, Supabase, Resend).

## 5) Conformite legale minimale

- [ ] Mentions legales publiees.
- [ ] Politique de confidentialite publiee.
- [ ] CGU/CGV publiees (incluant remboursement et abonnement).
- [ ] Base legale du traitement des donnees documentee.
- [ ] Process export/suppression compte defini (RGPD).
- [ ] Contrats sous-traitants (DPA) disponibles (Stripe, Supabase, Resend).

## 6) Produit (pret a vendre)

### 6.1 Parcours utilisateur
- [x] Paiement -> creation compte -> 1er acces sans friction.
- [ ] Onboarding complet en < 5 min.
- [ ] Mini tutoriel 3 etapes present.
- [ ] Dashboard metriques utiles + actions du jour.
- [ ] Suivi candidatures intuitif (ajout rapide + statuts en 1 clic).
- [ ] Profil editable + documents uploadables.

### 6.2 Experience premium
- [ ] Theme visuel coherent (web + mobile).
- [ ] Etats vides utiles sur toutes les pages.
- [ ] Chargements skeleton et feedback (toasts) en place.
- [ ] Mobile UX validee (grand iPhone inclus).
- [ ] Desktop large valide (ecrans 27"+).

### 6.3 Fiabilite
- [ ] Lint + typecheck passes.
- [ ] Erreurs runtime monitorables (Sentry ou equivalent).
- [ ] Logs API exploitables.
- [ ] Backups DB verifies.

### 6.4 Offres manuelles et matching profils
- [x] Matching declenche a l'ajout d'offres (admin + import CSV).
- [x] Matching nouveau profil a la fin de l'onboarding (`POST /api/profile`).
- [x] `POST /api/offers/match` — secours ops manuel (Bearer `CRON_SECRET`).
- [x] Mode `dryRun` disponible pour valider sans ecriture.
- [x] Insertion offres dans `offers` + dedup URL en place.
- [x] Matching auto profils/offres en place (job, region, contrat, domaine).
- [x] Creation `offer_assignments` + `notifications` en place.
- [x] Signalement lien mort + masquage auto a 3 signalements (`offer_link_reports`, `hidden_at`).
- [x] Admin : corriger URL / supprimer offre masquee.
- [ ] Cron de sync active (ex: toutes les 2h en journee).
- [ ] Monitoring des stats sync active (fetched, inserted, assigned).
- [ ] Revue conformite / ToS source offres validee avant usage a grande echelle.

## 7) Donnees et analytics

- [ ] Plan de tracking ecrit (events nommes clairement).
- [ ] Events minimum suivis:
  - [ ] visite landing
  - [ ] clic checkout
  - [ ] paiement reussi
  - [ ] onboarding termine
  - [ ] 1ere candidature creee
  - [ ] audit reserve
- [ ] Dashboard KPI quotidien disponible (Notion/Sheet/BI).
- [ ] Source de verite commerciale unique (Stripe).

## 8) Acquisition et conversion (objectif 200)

### 8.1 Mix canaux (objectif chiffre)
- [ ] Base existante (liste + anciens contacts): cible definie.
- [ ] Social organique (TikTok/Insta): cadence definie.
- [ ] Outbound DM: quota journalier defini.
- [ ] Partenariats ecoles/BDE/creators: pipeline active.
- [ ] Parrainage: mecanique simple active.

### 8.2 Funnel
- [ ] Landing orientee conversion (preuve + CTA unique).
- [ ] Checkout sans friction (mobile prioritaire).
- [ ] Sequence relance paniers abandonnes active.
- [ ] Script relance DM/mail J1/J3/J7 pret.
- [ ] Script de closing call pret.

### 8.3 Preuve sociale
- [ ] 5+ temoignages verifies publies.
- [ ] 3+ cas concrets avant/apres disponibles.
- [ ] Resultats quantifies affichables (sans surpromesse).

## 9) Operations et support

- [ ] SLA support defini (ex: <24h).
- [ ] Adresse support unique active.
- [ ] Macros support pretes (paiement, acces, remboursement, bug).
- [ ] Process de remboursement interne documente.
- [ ] Escalade incident critique documentee.

## 10) QA lancement (go/no-go)

- [x] Test e2e complet sur environnement prod-like.
- [ ] Scenarios verifies:
  - [x] Paiement accepte -> acces actif
  - [ ] Paiement refuse -> aucun acces
  - [ ] Abonnement annule -> acces coupe a date prevue
  - [x] Upload docs ok
  - [ ] Acces docs croises bloques
  - [x] Login/logout/reset password ok
- [x] Smoke test mobile (iPhone grand format) passe.
- [x] Smoke test desktop large passe.

## 11) Plan d'execution 30 jours (check hebdo)

### Semaine 1
- [x] Infra + Stripe + gating finis.
- [x] Landing + scripts acquisition prets.
- [ ] Lancement cohorte initiale (10-20).

### Semaine 2
- [ ] Publier preuves sociales.
- [ ] Relances systematiques actives.
- [ ] Optimiser pages selon data reelles.

### Semaine 3
- [ ] Doubler canaux gagnants.
- [ ] Couper canaux non rentables.
- [ ] Renforcer activation J1/J7.

### Semaine 4
- [ ] Sprint final conversion.
- [ ] Campagne deadline/urgence.
- [ ] Stabiliser support + retention.

## 12) Rituels de pilotage

### Quotidien (30 min)
- [ ] Paiements du jour.
- [ ] Taux conversion landing -> paiement.
- [ ] Tickets support critiques.
- [ ] Remboursements declenches.
- [ ] Decision: quoi doubler / quoi couper demain.

### Hebdomadaire (90 min)
- [ ] Revue canaux acquisition.
- [ ] Revue activation et retention.
- [ ] Revue incidents securite/qualite.
- [ ] Re-priorisation roadmap 7 jours.

## 13) Clarifications obligatoires avant depart

- [ ] Quel est le canal #1 pour trouver les 50 premiers payants?
- [ ] Quelle est la promesse exacte "resultat en X jours" legalement tenable?
- [ ] Quel est le plafond de budget acquisition pour 200 clients?
- [ ] Quelle est la limite de charge support par jour?
- [ ] Que fais-tu si le taux remboursement depasse 10%?
- [ ] Que fais-tu si la conversion checkout est <2% apres 7 jours?

## 14) Definition finale "pret a lancer"

Tu peux lancer si:

- [ ] Gating abonnement fonctionne a 100%.
- [ ] Donnees utilisateurs et documents sont techniquement proteges.
- [ ] Flux paiement -> acces est sans friction.
- [ ] Support, legal et monitoring sont operationnels.
- [ ] Tu peux mesurer et optimiser chaque etape du funnel.

---

## Notes de suivi (a remplir)

- Test paiement e2e valide (landing → checkout → activation compte → acces dashboard) : **13/06/2026**
- Test parcours acquisition complet (landing → signup gratuit → onboarding → offres → profil → upgrade Pro visible) : **23/06/2026**
- Infra prod validee (migrations lien mort, ADMIN_USER_ID, webhook Stripe, auth URLs) : **juin 2026**
- Cron matching retire — matching a l'ajout d'offres uniquement : **juin 2026**
- Dashboard admin pilotage (Gratuit/Pro, churn, remboursements Stripe, funnel) : **juin 2026**
- Date de debut:
- Date de lancement:
- Responsable produit:
- Responsable acquisition:
- Responsable support:
- KPI cible J+30:
- KPI atteint J+30:
