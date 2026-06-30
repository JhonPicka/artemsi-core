# CODEMAP — Index technique ARTEMSI

> **But de ce fichier :** carte du code pour aller **directement au bon fichier** sans tout relire.
> Le `README.md` = stratégie / business / produit. **Ce fichier = où vit le code et comment il s'articule.**
> Si tu ajoutes une feature, mets cette carte à jour (section concernée + tableau migrations si DB).

Stack : **Next.js 16** (App Router) · **React 19** · **Supabase** (auth/DB/storage) · **Stripe** · **Resend** · **TypeScript** · **Zod** · alias import `@/` → `app/src/`.

---

## 1. Où se trouve quoi (carte mentale)

```
app/src/
  proxy.ts            ← "middleware" Next : protège /dashboard /onboarding /admin, redirections auth
  app/                ← pages (page.tsx) + routes API (api/**/route.ts)
  components/         ← UI React, rangée par domaine (admin, offers, billing, landing…)
  lib/                ← TOUTE la logique métier (billing, matching, offers, lba, auth, stats…)
  lib/supabase/       ← clients Supabase (server / admin / client / proxy / route-handler)
  app/globals.css     ← tokens UI / design system (landing incluse)
supabase/migrations/  ← schéma SQL + RLS (ordre chronologique, 26 fichiers)
docs/                 ← design-system, auth-onboarding, plan croissance, checklist, Stripe
app/scripts/          ← scripts ops (.mjs/.mts) : test LBA, cleanup doublons, fix titres…
.cursor/rules/        ← règles landing responsive (mobile <768 / pc-tablette ≥768)
```

**Règle d'or pour trouver la logique :** elle est presque toujours dans `app/src/lib/`. Les `route.ts` et `page.tsx` ne font qu'appeler `lib/`. Cherche d'abord le fichier `lib/<sujet>.ts`.

---

## 2. Modèle de données (Supabase / Postgres)

Toutes les tables ont **RLS activé**. `set_updated_at()` = trigger commun `updated_at`.

| Table | Colonnes clés | Rôle | RLS |
|-------|---------------|------|-----|
| `profiles` | `id`(=auth.users), `email`, `full_name`, `study_level`, `study_domain`, `target_job`, `regions[]`, `contract_type`, `onboarding_completed`, `subscription_status`, `stripe_*` | Profil candidat + état abonnement | Owner only (`auth.uid()=id`) |
| `user_preferences` | `user_id`, `search_regions[]`, `target_job`, `contract_type`, `interest_keywords[]` | Préférences + mots-clés issus des intérêts jobboard | Owner |
| `user_documents` | `user_id`, `document_type`(cv/cover_letter), `file_path`, `is_active` | CV/LM dans Storage `user-documents` | Owner · 1 actif/type |
| `offers` | `title`, `company`, `location`, `url`, `source`(indeed/partner/autre), `is_public`, `is_partner_exclusive`, `study_domain`, `hidden_at`, `hidden_reason`, `external_key`, `max_applicants`, guide candidat | Catalogue offres | Lecture si `is_public && hidden_at null` OU assignée |
| `offer_assignments` | `user_id`, `offer_id`, `status`(sent/seen/applied/archived), unique(user,offer) | Offres « Pour moi » | Owner |
| `offer_interests` | `user_id`, `offer_id`, unique | « Ça m'intéresse » jobboard → affine matching | Owner |
| `offer_link_reports` | `user_id`, `offer_id`, unique | Signalement lien mort (**3 distincts → `hidden_at`**) | Owner insert/read |
| `applications` | `user_id`, `title`, `company`, `status`(sent/interview/accepted/rejected/archived), `applied_at`, lien offre, CV/LM | Suivi candidatures | Owner |
| `audit_bookings` | `user_id`, `slot_start/end`, `status`(pending/confirmed/declined/cancelled), `admin_token` | Réservations audit Pro 1 h · trigger → notifications | Owner (insert pending) |
| `notifications` | `user_id`, `type`, `title`, `link`, `read_at` | Notifs in-app (ex. audit confirmé) | Owner |
| `billing_customers` | `email`(PK), `subscription_status`, `stripe_*`, `last_event_id` | Source de vérité Stripe (par email) | **Aucun accès direct** (service_role only) |
| `user_activity_events` | `user_id`, `event_type`, `payload`(jsonb) | Tracking activité candidat (admin) | Owner insert |
| `rate_limits` | `bucket`, `key`, `count`, `reset_at` + fn `consume_rate_limit()` | Rate limiting API (service_role) | service_role |
| `lba_import_daily_decisions` | `import_date`(PK), `approved`, `decided_by` | Validation admin quotidienne import LBA | RLS on |

**Enums :** `study_level`, `contract_type`, `document_type`, `offer_source`, `offer_assignment_status`, `application_status`, `audit_status`, `subscription_status`.

**Migrations :** dossier `supabase/migrations/`, **exécuter dans l'ordre chronologique** (préfixe timestamp). Tableau détaillé dans `README.md` §8. Une nouvelle colonne/table = nouveau fichier `AAAAMMJJHHMMSS_nom.sql`, jamais éditer un existant déjà appliqué en prod.

---

## 3. Auth, sessions & gating (qui a le droit de quoi)

| Fichier | Rôle |
|---------|------|
| `lib/supabase/server.ts` | Client SSR (cookies) — usage normal côté serveur |
| `lib/supabase/admin.ts` | `createAdminClient()` — **service_role**, bypass RLS (webhook, crons, sync billing) |
| `lib/supabase/client.ts` | Client navigateur |
| `lib/supabase/proxy.ts` | `updateSession()` — refresh cookies dans le proxy |
| `lib/supabase/route-handler.ts` | Client pour les `route.ts` |
| `lib/auth.ts` | `getCurrentUser()`, `requireUser()` (redirect /login) |
| `lib/admin-auth.ts` | `isAdminUser()` (compare à `ADMIN_USER_ID`), `requireAdminUser()`, post-login path |
| `src/proxy.ts` | Protège `/dashboard /onboarding /admin` · redirige selon état (password setup, admin setup) |
| `lib/auth-session.ts` | `needsPasswordSetup()`, `resolvePostAuthRedirect()` |

**Niveaux d'accès (3) — définis dans `lib/billing.ts` :**
- `hasApiAccountAccess(user)` → tout utilisateur connecté (gratuit ou Pro).
- `userHasProAccess(user)` → abonnement **actif** (audit, jobboard 100 %, postuler exclusives). Admin & bypass email = true. `BILLING_ENFORCEMENT=false` → tout le monde Pro (dev local).
- `requireActiveSubscription(user)` → **ne bloque plus les gratuits** (freemium) ; sync billing.

**Gating freemium — `lib/freemium-access.ts` :**
- `FREE_JOBBOARD_FRACTION = 0.5` → gratuit voit la **moitié la moins récente** (`sliceJobboardForFreeTier`).
- `FREE_TIER_ASSIGNMENT_CAP = 2` → max 2 offres « Pour moi » non-partenaires (`canCreatePersonalAssignmentForUser`, `filterAssignmentPairsForFreeTier`).
- Offres exclusives partenaires : visibles mais **non postulables** en gratuit (`PARTNER_APPLY_BLOCKED_MESSAGE`).

**Billing / Stripe :**
- `lib/billing.ts` → activation checkout, `billing_customers` ↔ `profiles` sync, statut par email.
- `lib/stripe.ts` → `isBillingEnforced()`, `getStripeClient()`, `resolveAppBaseUrl()` (localhost en dev).
- `lib/billing-access.ts` → emails bypass. `lib/billing-offer.ts` → offre/prix affiché.

---

## 4. Offres & matching (cœur métier)

**Flux :** import (LBA / CSV / formulaire) → matching profils ↔ offres → `offer_assignments` → dashboard candidat.

| Fichier `lib/` | Rôle |
|----------------|------|
| `offer-matching.ts` | **Scoring** : `computeOfferMatchScore` (job 0-8 + contrat + domaine + intérêts), seuil `OFFER_MATCH_SCORE_THRESHOLD=3`. Filtre dur région + domaine. `buildProfileOfferPairs`. |
| `run-offer-matching.ts` | Orchestration matching catalogue récent |
| `match-user-offers.ts` | Matching d'un profil (fin d'onboarding) |
| `offer-assignment-batch.ts` | Création des assignations en lot |
| `run-daily-offer-assignments.ts` | Cron : ≤ 5 offres/jour/Pro dans « Pour moi » |
| `assign-offer-to-user.ts` | Assignation unitaire |
| `load-matchable-profiles.ts` | Charge profils éligibles au matching |
| `offer-link-reports.ts` | Logique signalement → masquage auto à 3 |
| `record-offer-interest.ts` | « Ça m'intéresse » → `interest_keywords` |
| `offer-interest-keywords.ts` | Extraction mots-clés d'une offre |

**Import La Bonne Alternance (LBA) :**
| Fichier | Rôle |
|---------|------|
| `lib/lba-client.ts` | Client API `api.apprentissage.beta.gouv.fr` (Bearer `LBA_API_TOKEN`) |
| `lib/lba-rome-mapping.ts` | Domaine d'étude → codes ROME |
| `lib/region-geopoints.ts` | Région → géopoint (recherche géolocalisée) |
| `lib/lba-import.ts` | Pipeline : recherche → **filtre sites carrière** (exclut France Travail/Indeed/HelloWork…) → matching obligatoire → dédup `external_key` |
| `lib/lba-import-daily-decision.ts` | Lecture/écriture validation admin quotidienne |

**Extraction offre depuis URL (IA) :** `offer-page-extract.ts`, `offer-structured-extract.ts`, `offer-extract-prompt.ts` (gros prompt), `offer-extract-merge.ts`, `offer-career-url.ts`, `offer-title-sanitize.ts`, `offer-csv-import.ts`, `admin-offer-url-platform.ts`, `admin-offer-schema.ts`.

**Affichage dashboard :** `offers-dashboard.ts`, `exclusive-offers-dashboard.ts`, `user-offer-assignments.ts`, `offer-application-guide.ts`, `offers-demo-preview.ts`. Constantes domaines : `study-domain.ts` + `constants.ts` (`STUDY_DOMAINS`, `REGIONS`, etc.).

---

## 5. Routes API (`app/src/app/api/**/route.ts`)

| Route | Méthode | Rôle |
|-------|---------|------|
| `profile` | POST | Maj profil + trigger matching onboarding |
| `profile/cv` | — | CV profil |
| `applications` | POST | Candidatures (gating gratuit/Pro) |
| `applications/cv-upload` | POST | Upload CV candidature |
| `audit/bookings` | POST | Réservation audit (**Pro**) |
| `offers/interests` | POST | Intérêt jobboard |
| `offers/link-report` | POST | Signalement lien mort |
| `offers/match` | POST | Re-match manuel (Bearer `CRON_SECRET`) |
| `stripe/checkout` | POST | Checkout Pro (essai 7 j) |
| `stripe/webhook` | POST | Events Stripe → `billing_customers` |
| `stripe/portal` / `status` | — | Portail client / statut |
| `account/activate` · `finish-signup` · `delete` | POST | Cycle de vie compte |
| `auth/reset-session` | POST | Reset session |
| `documents` · `notifications` · `activity` | — | Documents / notifs / tracking |
| `admin/offers` (+ `[id]`, `import`, `extract`, `match`) | — | CRUD offres admin |
| `admin/offers/lba-import` (+ `/decision`) | POST/GET | Import LBA manuel + validation quotidienne |
| `admin/audits/[id]` · `admin/profile` | — | Admin audits / profil |
| `cron/offers-import` | GET | **5h UTC** : import LBA + matching (si validé) |
| `cron/offers-daily-assign` | GET | **6h30 UTC** : ≤ 5 offres/jour/Pro |
| `cron/offers-match` | GET | Re-match catalogue |

**Crons :** protégés par `lib/cron-auth.ts` (Bearer `CRON_SECRET`). **Rate limiting :** `lib/rate-limit.ts` + RPC `consume_rate_limit`.

---

## 6. Pages (`app/src/app/**/page.tsx`)

- **Public / landing :** `page.tsx` (landing — **PC/tablette gelée**, voir règle .cursor), `cgu`, `confidentialite`, `mentions-legales`.
- **Auth :** `login`, `signup` (+ `/finish`, `/gratuit`), `activer-mon-compte`, `auth/callback`, `subscribe`, `checkout/success|cancel`, `onboarding`.
- **Dashboard candidat :** `dashboard` (overview), `/offres`, `/candidatures`, `/profil`, `/audit`.
- **Admin :** `admin` (pilotage), `/stats`, `/candidats` (+`[id]`), `/audits`, `/audit/[id]`, `/offres` (+ `nouvelle`, `import`, `matching`, `distribution`, `[id]`), `/setup`.

---

## 7. Composants UI (`app/src/components/<domaine>/`)

`admin/` (dashboard live, charts, offers list/form/import/matching, candidates kanban, lba decision) · `offers/` (offer-card, jobboard-card, toolbar, pagination, report-dead-link, application-guide) · `billing/` (subscribe-button, upgrade-card, manage-subscription) · `dashboard/` (overview, tabs, bottom-nav, assignment-offers) · `landing/` (hero, app-preview, plan-compare, faq, tiktok-reviews…) · `onboarding/` (form 5 étapes, progress) · `profile/` · `auth/` · `audit/` (calendar) · `applications/` · `theme/` (dark premium, toggle) · `ui/` (drawer, toast, skeleton, empty-state, celebration) · `legal/` · `activity/` (tracker).

---

## 8. Variables d'environnement (validées dans `lib/env.ts`)

**Requis :** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
**Recommandé :** `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, `ADMIN_USER_ID`, `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`.
**Stripe :** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`.
**IA extraction :** `OPENAI_API_KEY`, `OPENAI_MODEL`.
**LBA / crons :** `LBA_API_TOKEN`, `CRON_SECRET` (+ `LBA_API_BASE_URL`, `LBA_SEARCH_RADIUS_KM`, `LBA_SEARCH_LIMIT`).
**Landing/TikTok :** `NEXT_PUBLIC_LANDING_DEMO_VIDEO_URL`, `NEXT_PUBLIC_TIKTOK_TUTORIAL_URL`, `NEXT_PUBLIC_TIKTOK_URL`, `NEXT_PUBLIC_TIKTOK_HANDLE`.
**Dev :** `BILLING_ENFORCEMENT=false` → désactive le gating (tout le monde Pro).

---

## 9. Conventions & pièges

- **Logique → `lib/`**, jamais dans les `route.ts`/`page.tsx` (qui orchestrent seulement).
- Le « middleware » s'appelle **`src/proxy.ts`** (pas `middleware.ts`) ; le matcher liste les routes protégées.
- **`billing_customers`** = source de vérité Stripe par **email** ; `profiles.subscription_status` en est une copie synchronisée (`syncProfileSubscriptionStatus`).
- Admin = identité par **`ADMIN_USER_ID`** uniquement (pas juste l'email).
- Matching : **filtre dur** région + domaine, puis score ; un domaine taggé sur l'offre exclut les autres domaines (sauf `AUTRE`).
- Offre masquée = `hidden_at` non null (3 signalements ou action admin) ; sortie du jobboard + assignations.
- **Landing PC/tablette gelée** (≥768px) : ne modifier que le mobile via `@media (max-width:767px)`. Voir `.cursor/rules/landing-responsive-*.mdc`.
- Migrations : append-only, ordre chronologique, jamais réécrire une migration déployée.

---

## 10. Docs liées (à lire selon le besoin)

| Fichier | Quand le lire |
|---------|---------------|
| `README.md` | Stratégie, produit, business, roadmap |
| `docs/design-system.md` | **Avant tout changement visuel** |
| `docs/auth-profile-onboarding.md` | Auth, profil, onboarding, gating freemium |
| `docs/STRIPE_SETUP.md` | Config Stripe |
| `docs/README_CHECKLIST_MVP_200_USERS.md` | Checklist pré-lancement |
| `docs/plan-croissance-artemsi-2026.md` | KPIs / croissance |
| **`docs/CODEMAP.md`** (ce fichier) | **Trouver vite le bon fichier de code** |
