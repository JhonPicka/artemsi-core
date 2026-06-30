# Configurer Stripe (ARTEMSI)

> **Statut :** test paiement e2e valide le 13/06/2026 · freemium live juin 2026 (gratuit sans carte, Pro via `/subscribe`).

## 1. Cle secrete (obligatoire)

1. Ouvre **https://dashboard.stripe.com/test/apikeys**
2. Mode **Test** active (en haut a droite)
3. **+ Creer une cle secrete** → nom `ARTEMSI local` → **Copier**
4. La cle commence par `sk_test_` et fait **~100 caracteres**

Dans `app/.env.local` :

```bash
STRIPE_SECRET_KEY=sk_test_COLLE_ICI_LA_CLE_ENTIERE
```

**Ne pas utiliser** : `mk_...`, `pk_...`, ni un ID court.

## 2. Prix abonnement

Dashboard → **Produits** → ton abonnement 19,90 EUR/mois → copier **Price ID** (`price_...`)

```bash
STRIPE_PRICE_ID=price_...
```

## 3. Webhook (local)

Terminal 1 : `npm run dev`

Terminal 2 :

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copier le `whsec_...` affiche dans :

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 4. Verifier

- http://localhost:3000/api/stripe/status → `"ok": true`
- Landing → **S'abonner** → page Stripe Checkout

## 5. Apres paiement test

Carte : `4242 4242 4242 4242` · Creer compte avec **le meme email** que Stripe.

## 6. Test sur artemsi.fr (sans Stripe CLI)

Utile si tu testes avec une vraie personne sans debiter de carte : le checkout Stripe affiche **TEST MODE**.

1. Dashboard Stripe → bascule **Test** (pas Live).
2. **Cles API** : copie `sk_test_...` (pas `sk_live_`).
3. **Produits** (mode Test) : cree ou ouvre l'abonnement 19,90 EUR/mois → copie le **Price ID test** (`price_...`). Un price Live ne marche pas avec `sk_test_`.
4. **Webhooks** (mode Test) → **Ajouter une destination** :
   - URL : `https://artemsi.fr/api/stripe/webhook`
   - Evenements : `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copie le secret de signature `whsec_...`
5. **Vercel** → projet `artemsi-core` → Settings → Environment Variables (Production) :
   - `STRIPE_SECRET_KEY` = `sk_test_...`
   - `STRIPE_PRICE_ID` = `price_...` (test)
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...` (webhook test ci-dessus)
6. **Redeploy** le projet (Deployments → Redeploy).
7. Test : **S'abonner** sur artemsi.fr → carte `4242 4242 4242 4242` → email recu → **Creer mon compte** avec le meme email.

**Retour en live** : remets `sk_live_`, le `price_` live et le `whsec_` du webhook **Live**, puis redeploy.

> La page `/checkout/success` active aussi l'abonnement en base, mais l'**email d'activation** part surtout via le webhook : configure-le en test.
