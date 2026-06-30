# Plan de croissance ARTEMSI
## De 0 à 2 000 abonnés payants — Juin à Septembre 2026

**Version :** 1.0 — 7 juin 2026  
**Produit :** ARTEMSI — abonnement 19,90 €/mois  
**Site :** https://artemsi.fr  
**Destinataire :** Jhon Picka

---

## Résumé exécutif

Ce plan vise à faire passer ARTEMSI d'un produit fonctionnel avec quelques premiers payeurs à une machine d'acquisition et de rétention mesurable. L'objectif n'est pas la viralité immédiate : c'est de **construire un funnel reproductible** où chaque euro et chaque heure investis produisent des abonnés actifs, pas seulement des inscriptions.

**Principe directeur :** on mesure les **payants actifs** et le **MRR** (revenu récurrent mensuel), pas les « users » génériques.

| Scénario | Fin juin | Fin juillet | Fin septembre | MRR fin sept. |
|----------|----------|-------------|---------------|---------------|
| **Prudent** | 80 payants | 250 payants | 500 payants | ~9 950 € |
| **Réaliste** | 150 payants | 500 payants | 1 000 payants | ~19 900 € |
| **Stretch** | 300 payants | 800 payants | 2 000 payants | ~39 800 € |

Tu pilotes au **scénario réaliste**. Le stretch reste un cap motivant, pas une prévision opérationnelle.

---

## Partie 1 — Où en est ARTEMSI aujourd'hui

### Acquis (juin 2026)
- Produit en production sur artemsi.fr
- Paiement Stripe fonctionnel (19,90 €/mois)
- Parcours d'activation payeur stabilisé (`/activer-mon-compte` sans dépendre de l'email)
- Premiers payeurs réels (dont shaymajem@gmail.com — activation validée)
- Dashboard, onboarding, matching offres, espace admin

### Points de vigilance
- Pas encore de notoriété de marque
- Acquisition quasi nulle hors réseau direct
- Pas de funnel analytics instrumenté de bout en bout
- Pas encore de programme de parrainage
- Emails transactionnels Supabase parfois en spam / non reçus

### Ce que ça implique
La croissance des 30 prochains jours repose sur **toi** : réseau, contenu, preuves sociales, et optimisation du taux de conversion — pas sur le SEO ou la presse.

---

## Partie 2 — Définitions et KPIs (non négociables)

### Vocabulaire
| Terme | Définition |
|-------|------------|
| **Visiteur** | Quelqu'un qui arrive sur artemsi.fr |
| **Lead** | Clique sur « S'abonner » ou remplit un formulaire |
| **Checkout** | Arrive sur Stripe Checkout |
| **Payant** | Paiement confirmé + abonnement actif |
| **Activé** | Mot de passe choisi + onboarding complété |
| **Actif M+1** | Toujours abonné et connecté au mois suivant |

### KPIs hebdomadaires à suivre

| KPI | Formule | Cible semaine 1 | Cible fin juin |
|-----|---------|-----------------|----------------|
| Taux landing → checkout | Checkouts / Visiteurs landing | 5–10 % | 10–15 % |
| Taux checkout → payant | Payants / Checkouts | 40–60 % | 50–70 % |
| Taux activation | Activés / Payants | 70 %+ | 85 %+ |
| Churn mensuel | Résiliations / Payants début mois | < 15 % | < 10 % |
| CAC (coût acquisition) | Dépense pub / Nouveaux payants | N/A sem. 1 | < 20 € |
| MRR | Payants actifs × 19,90 € | Suivre | Suivre |

### Funnel type (à valider avec tes vrais chiffres)

```
1 000 visiteurs
  → 80 clics S'abonner (8 %)
  → 40 checkouts (50 %)
  → 28 payants (70 %)
  → 22 activés (80 %)
  → 18 actifs M+1 (80 % rétention)
```

**Objectif semaine 1 réaliste :** 500–1 000 visiteurs qualifiés → **20 à 40 payants activés**.

---

## Partie 3 — Offre de lancement (à activer dès demain)

### Proposition
**« Les 30 premiers abonnés : 1 mois offert »**  
ou **« -50 % pendant 3 mois »** (9,95 €/mois)

### Mise en œuvre
1. Créer un coupon Stripe (ou prix promotionnel temporaire)
2. Afficher sur la landing et `/subscribe` avec deadline visible
3. Utiliser l'urgence : « Plus que X places »
4. Communiquer en DM : « Tu fais partie des premiers — accès privilégié »

### Pourquoi c'est crucial
À ce stade, tu vends la **confiance** autant que le produit. Une offre limitée donne une raison d'agir maintenant et génère tes premiers témoignages.

---

## Partie 4 — Semaine 1 (J1 à J7) — Plan jour par jour

**Objectif réaliste : 20–40 payants activés**  
**Leviers : réseau direct + LinkedIn (2 seulement, en profondeur)**

### Jour 1 — Lundi : Fondations
**Matin (2h)**
- [x] Vérifier déploiement prod (artemsi.fr, activation, Stripe)
- [ ] Créer tableau de suivi (Notion / Google Sheet) : Date | Source | Email | Payé | Activé | Notes
- [ ] Préparer 3 messages types (DM court, DM long, LinkedIn post)

**Après-midi (3h)**
- [ ] Lister 100 contacts qualifiés (recherche emploi, reconversion, jeunes diplômés)
- [ ] Envoyer 30 DMs personnalisés (pas de copier-coller identique)
- [ ] Publier 1 post LinkedIn : pourquoi j'ai créé ARTEMSI + lien

**Soir (30 min)**
- [ ] Répondre à tous les messages
- [ ] Noter dans le tableau : qui a cliqué, qui a payé

### Jour 2 — Mardi : Volume réseau
- [ ] 40 DMs personnalisés
- [ ] Relancer les 30 d'hier sans réponse (message différent, plus court)
- [ ] Contacter les payeurs existants pour témoignage (2–3 phrases + prénom)
- [ ] Objectif : 5+ checkouts dans la journée

### Jour 3 — Mercredi : Preuve sociale
- [ ] Intégrer 1–2 témoignages sur la landing (même courts)
- [ ] Post LinkedIn avec témoignage ou capture dashboard (floutée si besoin)
- [ ] 30 DMs + 10 messages WhatsApp réseau proche
- [ ] Rejoindre 5 groupes Facebook/LinkedIn emploi (sans spammer)

### Jour 4 — Jeudi : Communautés
- [ ] 1 post valeur dans 3 groupes (conseil emploi, pas pub directe)
- [ ] Répondre à 10 posts d'autres personnes en commentant utilement
- [ ] 30 DMs
- [ ] Identifier 5 coachs carrière / consultants RH à contacter demain

### Jour 5 — Vendredi : Partenariats légers
- [ ] Contacter 5 coachs : proposition affiliation 20 % ou accès gratuit 3 mois
- [ ] 30 DMs
- [ ] Bilan mi-semaine : combien visiteurs, checkouts, payants, activés ?
- [ ] Ajuster le message qui convertit le mieux

### Jour 6 — Samedi : Contenu
- [ ] 1 vidéo courte (60–90 sec) : démo produit ou témoignage
- [ ] Publier sur LinkedIn + Instagram Reels si possible
- [ ] 20 DMs (réseau plus personnel le week-end)

### Jour 7 — Dimanche : Bilan semaine 1
- [ ] Compiler les chiffres
- [ ] Identifier le canal #1 (DM LinkedIn ? WhatsApp ? Post ?)
- [ ] Décider : doubler sur ce canal semaine 2
- [ ] Préparer semaine 2

### Messages types

**DM court**
> Salut [Prénom], je lance ARTEMSI — un outil qui t'aide à trouver des offres adaptées à ton profil et à structurer ta recherche d'emploi. Les 30 premiers ont 1 mois offert. Ça t'intéresse que je t'envoie le lien ?

**DM relance**
> Hey [Prénom], je me permets de relancer — l'offre lancement se termine bientôt. 2 min pour voir si ça peut t'aider dans ta recherche : artemsi.fr

**Post LinkedIn**
> Il y a 3 mois, j'ai constaté que [problème concret]. J'ai donc construit ARTEMSI. Aujourd'hui, les premiers utilisateurs [résultat concret]. Si tu es en recherche d'emploi ou reconversion, les 30 premières places sont à 1 mois offert → artemsi.fr

---

## Partie 5 — Semaines 2 à 4 (fin juin) — 40 à 150 payants

**Objectif réaliste fin juin : 80–150 payants actifs**

### 2 leviers prioritaires (pas plus)
1. **LinkedIn organique** — 1 post/jour + DMs ciblés
2. **Partenariats micro** — 3–5 coachs / formateurs avec audience 1k–20k

### Actions récurrentes
| Fréquence | Action |
|-----------|--------|
| Quotidien | 1 post LinkedIn + 20 DMs + réponses commentaires |
| 2×/semaine | Relance payeurs non activés (`/activer-mon-compte`) |
| Hebdo | 1 partenariat contacté + 1 témoignage collecté |
| Hebdo | Bilan KPIs + ajustement message/offre |

### Ce qu'on ne fait PAS encore (trop tôt)
- Grosse campagne Meta Ads (attendre 30+ payants et taux activation connu)
- SEO massif (poser 2 articles, pas plus)
- Presse / médias (contacts OK, pas de dépendance)
- Newsletter hebdo (semaine 3 si temps)

### Produit à livrer en juin (ordre de priorité)
1. **Landing avec témoignages + offre lancement visible**
2. **Rappel page succès paiement** : « Email non reçu ? → /activer-mon-compte »
3. **Dashboard admin : métriques croissance** (payants, activés, churn)
4. **Emails J+1 et J+7** post-activation (valeur produit, pas marketing vide)

---

## Partie 6 — Juillet — 150 à 500 payants

**Objectif réaliste : 400–500 payants**  
**Attention : juillet = ralentissement (vacances France)**

### Nouveaux leviers
1. **Programme de parrainage** — 1 mois offert par filleul converti
2. **Meta Ads test** — 10–15 €/jour, 3 accroches, ciblage 25–45 ans reconversion
3. **1 partenaire « ancre »** — école, association insertion, ou coach 50k+ audience

### Règles pub
- Ne lancer ads qu'après **taux activation > 70 %**
- Stopper une accroche si CAC > 25 € après 50 clics
- Rediriger vers landing avec témoignages, pas direct checkout

### Produit juillet
- Notifications offres matchées (email ou in-app)
- Indicateur progression onboarding / profil
- Page `/parrainage` avec lien unique
- Support réponse < 4h ouvrées

---

## Partie 7 — Août–Septembre — 500 à 1 000–2 000 payants

**Objectif réaliste fin septembre : 800–1 000 payants**  
**Stretch : 2 000**

### Août (vacances — mode entretien)
- Maintenir contenu 3×/semaine (pas quotidien)
- Optimiser rétention et onboarding (réduire churn)
- Préparer rentrée septembre : campagne « La rentrée, le bon moment pour relancer sa recherche »

### Septembre (accélération)
- Augmenter budget pub sur l'accroche gagnante
- Parrainage poussé (les users satisfaits reviennent de vacances)
- Forfait annuel (2 mois offerts) pour améliorer trésorerie
- 1 événement live (webinar « Optimiser sa recherche d'emploi avec l'IA »)

### Produit septembre
- Offre annuelle Stripe
- Amélioration matching + alertes
- Première version « entreprise » ou B2B2C (écoles, OPCO) si partenariat signé

---

## Partie 8 — Préparer le futur d'ARTEMSI (au-delà de l'acquisition)

### Infrastructure technique (Q3 2026)
| Priorité | Action | Pourquoi |
|----------|--------|----------|
| Haute | Analytics funnel complet | Savoir ce qui convertit |
| Haute | Monitoring erreurs (Sentry ou équivalent) | Éviter perte users comme shaymajem |
| Moyenne | Emails transactionnels custom (Resend/SendGrid) | Délivrabilité |
| Moyenne | Backups + runbook incidents | Sérénité prod |
| Basse | Multi-env staging | Tests avant deploy |

### Organisation (quand tu passes 100 payants)
- Documenter process support (FAQ, macros réponses)
- 1 créneau/jour dédié support uniquement
- Envisager freelance community manager (10–15h/semaine) à 200+ payants
- Envisager dev freelance ponctuel pour parrainage / analytics

### Juridique & conformité
- CGU/CGV à jour (abonnement, résiliation, remboursement)
- Politique confidentialité RGPD
- Factures Stripe conformes
- Registre traitements si données sensibles (CV)

### Financier
| Payants | MRR brut | MRR net (~85 % après Stripe/churn) |
|---------|----------|-------------------------------------|
| 100 | 1 990 € | ~1 690 € |
| 500 | 9 950 € | ~8 450 € |
| 1 000 | 19 900 € | ~16 900 € |
| 2 000 | 39 800 € | ~33 800 € |

**Réinvestissement recommandé :**
- 0–100 payants : 0–200 €/mois pub, reste = temps
- 100–500 : 500–1 500 €/mois pub + outils
- 500+ : 20–30 % du MRR en acquisition si LTV > 3× CAC

### Vision produit 6 mois
1. **Court terme** — Meilleur matching, alertes, onboarding fluide
2. **Moyen terme** — Coaching IA, suivi candidatures, CV optimisé
3. **Long terme** — Marketplace B2B (recruteurs), API partenaires, mobile app

---

## Partie 9 — Rituel hebdomadaire (le pilote de croissance)

Chaque dimanche soir, 45 minutes :

1. **Chiffres** — Visiteurs, checkouts, nouveaux payants, activés, churn, MRR
2. **Canal** — Quel levier a le mieux performé ?
3. **Blocage** — Où le funnel fuit ? (landing ? checkout ? activation ?)
4. **Décision** — 1 chose à doubler, 1 chose à arrêter
5. **Semaine suivante** — 3 objectifs max, écrits noir sur blanc

### Template bilan hebdo

```
Semaine du [date]
- Nouveaux payants : X (objectif : Y)
- Taux activation : X %
- MRR : X €
- Meilleur canal : [LinkedIn / DM / Partenaire / Pub]
- Problème #1 : [ex. 40 % payeurs n'activent pas]
- Action #1 semaine prochaine : [ex. SMS relance activation]
```

---

## Partie 10 — Risques et parades

| Risque | Probabilité | Parade |
|--------|-------------|--------|
| Payeurs n'activent pas | Moyenne | Email + SMS relance, `/activer-mon-compte` visible partout |
| Churn élevé mois 1 | Haute | Valeur J+1/J+7, offres matchées rapidement |
| Épuisement solo | Haute | 2 leviers max, pas 8 ; batch DMs 2h/jour |
| CAC trop élevé | Moyenne | Pas de pub avant funnel optimisé |
| Concurrents (LinkedIn, Indeed) | Haute | Positionner sur accompagnement + matching, pas « annonces » |
| Problème technique prod | Moyenne | Monitoring, runbook, page statut |

---

## Partie 11 — Checklist « Prêt pour 100 payants »

- [x] Paiement Stripe live
- [x] Activation sans email (`/activer-mon-compte`)
- [ ] Offre lancement Stripe (coupon)
- [ ] Témoignages sur landing
- [ ] Tableau suivi KPIs
- [ ] 3 messages DM testés
- [ ] Emails J+1 / J+7
- [ ] Dashboard admin métriques
- [ ] Programme parrainage (juillet)
- [ ] Meta Ads test (après 30 payants)

---

## Conclusion — Le plan « infaillible »

Un plan infaillible n'est pas un plan sans échec. C'est un plan qui :

1. **Mesure la réalité** (payants, pas vanity metrics)
2. **Concentre l'énergie** (2 leviers, pas 10)
3. **Corrige vite** (bilan hebdo, ajustement message/offre)
4. **Protège le produit** (activation, rétention, support)
5. **Prépare l'échelle** (analytics, parrainage, partenariats avant la grosse pub)

**Demain matin, 3 actions seulement :**
1. Créer l'offre lancement Stripe
2. Envoyer 30 DMs personnalisés
3. Publier 1 post LinkedIn

Le reste suit.

---

*Document généré pour ARTEMSI — artemsi.fr*  
*Contact : jhon95@hotmail.fr*
