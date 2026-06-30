# Auth + Profil + Onboarding (V1)

Ce document decrit le fonctionnement technique du module de creation de compte candidat.

## Stack

- Next.js 16 (App Router)
- Supabase Auth (email/password)
- Supabase Postgres (profil, preferences, documents)
- Supabase Storage (bucket prive `user-documents`)

## Parcours utilisateur

### Inscription gratuite (parcours principal — juin 2026)

1. Landing → **Commencer gratuitement** → `/signup` (email + MDP).
2. Confirmation email Supabase → `/auth/callback` → onboarding si besoin → `/dashboard`.
3. Upgrade Pro optionnel depuis `/subscribe` (checkout Stripe + essai 7 j).

### Apres paiement Stripe (upgrade Pro)

1. Webhook Stripe (`checkout.session.completed`) envoie **un seul** email avec lien Supabase.
2. Clic → `/auth/callback` → `/signup/finish` (email grise, choix du mot de passe).
3. `user_metadata.password_setup_pending` passe a `false`, puis onboarding / dashboard.

### Secours

- `/signup?email=...` : inscription manuelle si email non recu (verifie abonnement actif).
- `resendSetupEmailAction` : renvoi du lien depuis `/signup?email=...`.

### Connexion

- `/login` : email + mot de passe uniquement.
- Le proxy n'intercepte pas `/signup/finish` ni `/auth/callback`.
4. Il renseigne les champs obligatoires:
   - email (source auth)
   - nom/prenom
   - telephone
   - nom de l'ecole
   - niveau d'etude
   - poste recherche
   - regions ciblees
   - date de debut
   - type de contrat
5. Il peut uploader CV/lettre (optionnels en V1).
6. Une fois le profil complete, il accede au dashboard.

## Gating et securite

- **Freemium (juin 2026)** : tout user authentifie accede au dashboard (`hasApiAccountAccess`). Pro = `userHasProAccess` (abonnement actif).
- `app/src/proxy.ts` + `app/src/lib/auth-session.ts` :
  - non connecte sur routes protegees → `/login`
  - `password_setup_pending` → `/signup/finish`
  - sinon `resolvePostAuthRedirect` (abonnement, onboarding, dashboard)
- RLS est active sur `profiles`, `user_preferences`, `user_documents`.
- Le bucket storage est prive et segmente par dossier utilisateur (`{user_id}/...`).

## Endpoints

- `POST /api/profile`
  - payload JSON valide par `onboardingSchema`
  - upsert `profiles` + `user_preferences`
  - marque `onboarding_completed = true`

- `POST /api/documents`
  - accepte `multipart/form-data` avec:
    - `documentType`: `cv` ou `cover_letter`
    - `file`: PDF/DOC/DOCX, max 10MB
  - upload dans `user-documents`
  - desactive l'ancien document actif du meme type
  - cree un nouvel enregistrement `user_documents`

## Schema de donnees (resume)

- `profiles` (1:1 avec `auth.users`)
- `user_preferences` (1:1, regions/type contrat/poste cible)
- `user_documents` (N:1, versioning soft via `is_active`)

Migration de reference:
- `supabase/migrations/20260425170000_init_auth_profile_onboarding.sql`

## Supabase (prod)

Dans **Authentication → URL Configuration**, ajouter aux redirect URLs :

- `https://<ton-domaine-app>/auth/callback`
- `http://localhost:3000/auth/callback` (local)

Site URL : URL de l'app (`NEXT_PUBLIC_APP_URL`).

## Evolutions conseillees

- Ajouter verification email obligatoire en production (deja couvert par le lien invite)
- Ajouter `profiles.role` (`user`/`admin`)
- Ajouter signatures URL temporaires pour telechargement doc
- Ajouter audit trail pour modifications profil/documents
