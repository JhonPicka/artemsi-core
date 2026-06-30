# ARTEMSI — Design system & vision UI

> **But du document.** Figer la **vision visuelle** d'ARTEMSI (landing + app) après les
> itérations de mai 2026, pour que **toute évolution future** (nouvelle page, nouveau
> composant, refonte) garde **la même identité**. Si tu hésites entre deux options
> visuelles, choisis celle qui colle au plus près de ce qui est décrit ici.
>
> **À lire avant** : tout PR qui touche à l'UI (`app/src/app/**/*.tsx`,
> `app/src/components/**`, `app/src/app/globals.css`). Les agents IA (Cursor,
> Claude, Codex) doivent ouvrir ce document **avant** d'écrire la moindre ligne de
> CSS/JSX.

---

## 1. Vision design en une phrase

> **« Premium sombre, violet calme, dense mais aéré, orienté action — le candidat
> doit sentir qu'on prend son temps au sérieux dès la première seconde. »**

Trois lectures complémentaires :

1. **Confiance** (le ton du README — *réduire le bruit*) → couleurs sobres, jamais
   d'effet criard ou trop "growth hacker", pas de stock-image générique.
2. **Jeune cadre motivé** (cible alternance) → typographie nette, micro-animations
   fines, structure de produit "type SaaS premium" (Linear / Notion / Stripe), pas
   un site de coaching.
3. **Action** (chaque écran doit déboucher sur une suite logique) → CTA primaires
   très visibles, pipeline / actions du jour mis en avant, pas de mur de texte.

Toute proposition visuelle doit pouvoir être validée à voix haute par les trois
filtres : *est-ce que ça inspire confiance, est-ce qu'un jeune cadre s'y sent
chez lui, est-ce que l'action suivante est évidente ?* Si **non** à l'un d'eux,
on retravaille.

---

## 2. Source de vérité technique

Tous les tokens (couleurs, rayons, ombres, typographie) vivent dans
`app/src/app/globals.css`, en haut du fichier (`:root { … }`). **Ne jamais
hardcoder une couleur, un rayon ou une ombre dans un composant** : on passe
toujours par les variables CSS pour rester cohérent.

> Si une nouvelle nuance est nécessaire, on l'ajoute comme variable CSS dans `:root`
> avant de l'utiliser, **et** on l'ajoute dans la section correspondante de ce
> document (Couleurs / Surfaces / Statuts).

---

## 3. Palette & tokens

### 3.1 Marque

| Token              | Valeur                       | Usage                                     |
| ------------------ | ---------------------------- | ----------------------------------------- |
| `--primary`        | `#7c5cff`                    | CTA principal, accents pleins             |
| `--primary-2`      | `#a88aff`                    | Survol, kicker, chevrons, surlignage onglet |
| `--primary-hover`  | `#6b49f2`                    | Hover des CTA primaires                   |
| `--primary-soft`   | `rgba(124, 92, 255, 0.14)`   | Pastilles "Exemple", fonds doux           |
| `--primary-soft-strong` | `rgba(124, 92, 255, 0.28)` | Sélection texte, séparateurs accentués   |
| `--primary-glow`   | `rgba(124, 92, 255, 0.45)`   | Glow / `--shadow-pop`                     |

> **Règle.** Une page sans accent violet visible = une page qui ne ressemble plus
> à ARTEMSI. Au moins un point d'ancrage violet par section (badge, bouton,
> chevron, bordure de carte mise en avant).

### 3.2 Surfaces

**Dark first**, **light en option**. Le thème par défaut reste sombre
(c'est l'identité de marque). Un thème clair existe en opt-in via un toggle
iOS placé dans :

- le **footer de la landing** (`<ThemeToggle variant="compact" />`)
- la carte **Réglages** de la page Profil (`<ThemeToggle variant="card" />`)

Le choix utilisateur est persisté dans `localStorage` (clé `artemsi-theme`)
et appliqué avant l'hydratation React via le script `themeBootstrapScript`
injecté dans `<head>` (cf `app/src/app/layout.tsx`) — ça évite le flash
sombre→clair au chargement.

> **Règle pour les nouveaux composants.** N'utiliser **que** des variables CSS
> du `:root`. Le bloc `[data-theme="light"]` réécrit automatiquement les valeurs ;
> tout composant qui suit la règle « zéro couleur en dur » fonctionne dans les
> deux thèmes sans effort. Pour un dégradé `background-clip: text`, utiliser
> `var(--hero-title-grad)` plutôt que des hex en dur.

| Token                 | Valeur     | Usage                                               |
| --------------------- | ---------- | --------------------------------------------------- |
| `--background`        | `#0c0922`  | Fond global de l'app                                |
| `--background-deep`   | `#060418`  | Fond bas du dégradé                                 |
| `--surface`           | `#16122f`  | Cartes "secondaires" (hero, nav)                    |
| `--surface-strong`    | `#1b173a`  | Cartes principales (KPI, panneau dashboard)         |
| `--surface-raised`    | `#211c47`  | Modales, popovers, états hover                      |
| `--surface-soft`      | `rgba(255,255,255,0.035)` | Bandes de remplissage (table headers) |
| `--surface-soft-strong` | `rgba(255,255,255,0.06)` | Highlight de ligne                |

Le **fond `body`** combine deux radial-gradients violets dans le coin haut-gauche
et haut-droit + un linéaire vertical. C'est ce qui donne la sensation
"aurore en arrière-plan". Ne pas remplacer par un fond plat.

### 3.3 Texte

| Token             | Valeur     | Usage                                  |
| ----------------- | ---------- | -------------------------------------- |
| `--foreground`    | `#f3f1fb`  | Titres, valeurs, texte principal       |
| `--foreground-soft` | `#dcd6ee` | Texte secondaire fort                  |
| `--muted-strong`  | `#c5bfd5`  | Sous-titres, descriptions de cartes    |
| `--muted`         | `#9c95b6`  | Métadonnées, libellés petits           |

> **Anti-pattern.** Texte gris sur fond gris. Si la lecture demande un effort, on
> remonte d'un cran (`--muted` → `--muted-strong` ou `--foreground-soft`).

### 3.4 Statuts

| Token         | Valeur    | Soft variant         | Usage                      |
| ------------- | --------- | -------------------- | -------------------------- |
| `--success`   | `#28d39a` | `--success-soft`     | Acceptée, momentum positif |
| `--warning`   | `#ffb547` | `--warning-soft`     | À relancer, momentum à plat / down |
| `--danger`    | `#ff5d7a` | `--danger-soft`      | Refusée, erreurs           |

Toujours **trio** `color + soft + border` (`--success-border`, etc.) pour pastilles
et chips. Pas d'exception.

### 3.5 Rayons

| Token         | Valeur | Usage                                 |
| ------------- | ------ | ------------------------------------- |
| `--radius-sm` | 8px    | Inputs, focus ring                    |
| `--radius-md` | 12px   | Chips, mini-cartes (KPI, stats)       |
| `--radius-lg` | 16px   | Cartes principales du dashboard       |
| `--radius-xl` | 20px   | Cartes signature de la landing        |
| `--radius-pill` | 999px | Badges, pills, toggle iOS             |

### 3.6 Ombres

| Token            | Usage                                              |
| ---------------- | -------------------------------------------------- |
| `--shadow-xs`    | Boutons secondaires, micro-élévation               |
| `--shadow-sm`    | Cartes plates (hero, sections du dashboard)        |
| `--shadow`       | Cartes principales (KPI, panneau)                  |
| `--shadow-lg`    | Modales, popovers                                  |
| `--shadow-pop`   | Glow violet sur CTA primaire & focus               |

### 3.7 Typographie

- Pile : `--font-geist-sans` (chargée par Next.js) + fallback Apple/Segoe.
- **Titres H1/H2/H3** : `letter-spacing: -0.02em`, `line-height: 1.15`.
- **Hero titres** (landing & dashboard) : dégradé blanc → lavande
  (`linear-gradient(140deg, #ffffff 0%, #c8bfff 100%)` + `background-clip: text`).
- **Étiquettes de section** (`dash-panel-section-label`) : `0.68rem`, `font-weight: 700`,
  `letter-spacing: 0.08em`, `text-transform: uppercase`, couleur `--muted`.
- **Valeurs chiffrées** : `font-variant-numeric: tabular-nums` **systématique** (KPI,
  stats, totaux). Permet l'alignement vertical des chiffres → lisibilité.
- **Tabular nums + font-weight 800** = look "valeur clé" reconnaissable sur tout
  le produit.

---

## 4. Composants signature

Ces patterns sont **la signature visuelle d'ARTEMSI**. Toute nouvelle page doit
les réutiliser — pas en réinventer une variante.

### 4.1 Carte panneau (`.dash-card--panel` + `.dash-panel`)

- Fond `--surface-strong` + bordure 1px `--border`, rayon `--radius-lg`,
  shadow `--shadow`.
- Padding intérieur `1.2rem 1.25rem 1.35rem`.
- En-tête à 2 colonnes : titre + sous-titre à gauche, **toggle à droite**.
- Optionnel : un **bandeau de chips** (Total / Moyenne / Pic) immédiatement sous
  l'en-tête, en grille 3 colonnes (1 colonne sur mobile < 520px).
- Contenu principal sous forme de sections fines avec `dash-panel-section-label`
  en uppercase plutôt que des H3 imposants.

### 4.2 Toggle iOS (`.dash-ios-switch`)

C'est **la** mécanique d'interaction "switch" de l'app. Format :

```tsx
<div className="dash-panel-toggle" role="group">
  <span className={`dash-toggle-side${active === "left" ? " is-active" : ""}`}>Gauche</span>
  <button
    type="button"
    className="dash-ios-switch"
    data-state={active === "right" ? "on" : "off"}
    onClick={() => setActive((v) => (v === "left" ? "right" : "left"))}
    aria-pressed={active === "right"}
    aria-label="…"
  >
    <span className="dash-ios-switch-thumb" aria-hidden />
  </button>
  <span className={`dash-toggle-side${active === "right" ? " is-active" : ""}`}>Droite</span>
</div>
```

Pas de "Tabs" classiques pour les vues à 2 modes. Le toggle iOS est plus
identifiable, plus tactile, et plus en phase avec la cible.

**Variantes câblées en réutilisant ce switch :**

- `<AssignmentOffersPanel>` → bascule **Graphique / Chiffres**.
- `<ThemeToggle>` (`app/src/components/theme/theme-toggle.tsx`) → bascule
  **Sombre / Clair** avec icônes lune ☾ et soleil ☀ et libellés
  "Sombre" / "Clair". Variantes :
  - `variant="compact"` : version inline pour le footer landing.
  - `variant="card"` : version "carte de réglage" avec titre + sous-titre,
    pour la page Profil (carte **Réglages**).

### 4.3 Chips KPI (`.dash-stat-chip`, `.dash-kpi-card`)

- Mini-cartes alignées en grille (3 sur desktop, 1 sur mobile).
- Étiquette uppercase 0.62rem en `--muted`, valeur 1.18rem `font-weight: 800` en
  `tabular-nums`.
- Léger dégradé violet vertical (`linear-gradient(180deg, rgba(124, 92, 255, 0.08), transparent 60%)`)
  + `--surface-strong`.
- Variantes tonales : `tone-accent | tone-success | tone-warning | tone-default`.

### 4.4 Pipeline candidatures (`.dash-pipeline`, `.dash-pipe-step`)

- Pastilles colorées par statut, valeur grosse + libellé petit dessous.
- Variants `success` / `warning` / `danger` / `default`. Toujours utiliser le
  trio `color + soft + border`.

### 4.5 Histogramme minimal (`.dash-chart-bars`)

- 14 barres maximum (1 par jour) avec **plafond visuel à 5 offres / jour**
  (constante `CHART_OFFERS_SCALE_MAX`). Au-delà → barre pleine.
- Hauteur minimale 6 % pour les valeurs nulles, 10 % minimum pour les valeurs > 0
  (lisibilité).
- Tooltip court : `« Mer 1 mai : 3 offres »`. Pas de jargon ("décor fictif",
  "overlay") visible côté utilisateur.

### 4.6 Bouton primaire (`.button-link` + `.landing-cta-primary`)

- Padding généreux, `border-radius: var(--radius-pill)`, shadow `--shadow-pop`
  (glow violet) au hover.
- Toujours **un seul** CTA primaire visible par section. Le secondaire utilise
  `.secondary-link`.

### 4.7 Détails repliables (`.dash-panel-details`)

- `<details>` HTML natif, marker natif masqué.
- Chevron custom `›` qui pivote (90°) à l'ouverture, couleur `--primary-2`.
- Contenu masqué par défaut quand il s'agit d'info secondaire (tableau jour par
  jour, debug…).

### 4.8 Hero dashboard (`.dash-hero`)

- Fond `--surface` + 2 radial-gradients violets aux coins haut-gauche et
  haut-droit (signature visuelle reconnaissable).
- Kicker `Tableau de bord` en haut (`--primary-2`, uppercase, 0.7rem).
- Titre en dégradé blanc → lavande, sous-titre en `--muted-strong`.
- Badge **momentum** (↑ ↓ →) avec coloration selon la tendance.

### 4.9 États vides

- **Jamais** un écran ou une carte vide.
- Toujours phrase courte + verbe d'action (ex. *« Dès qu'ARTEMSI t'enverra des
  offres ciblées, le graphique apparaît ici. »*).
- Optionnel : CTA secondaire vers la prochaine action utile.

---

## 5. Layout & spacing

- **Container app** : `max-width: 1240px` avec `padding: 0 clamp(1rem, 3vw, 2rem)`
  (cf `.landing-container`).
- **Spacing rythmique** : multiples de `0.25rem` (4px). Pas de valeurs au pixel
  près sortis du chapeau.
- **Empilement de cartes** : `gap: 1.25rem` à `1.5rem` entre cartes du
  dashboard ; `gap: 1rem` entre sections internes ; `gap: 0.5rem` entre chips.
- **Mobile first** : tous les nouveaux composants doivent passer en colonne unique
  sous `520px`. Tester systématiquement en `375px` (iPhone SE).
- **Above the fold mobile** : le titre + 1 CTA principal doivent être visibles
  sans scroll sur 375 × 667 (cf README, axes d'amélioration #8).

---

## 6. Interactions & micro-animations

- **Transitions** : `transition: ... 0.12s ease` à `0.18s ease`. Au-dessus on
  perd le côté "snappy".
- **Hover** : la carte se soulève très légèrement (translateY -1px ou shadow plus
  forte), jamais d'agrandissement type 1.05.
- **Focus visible** : conservé partout (`--ring` violet 2px, offset 2px). On ne
  désactive **jamais** `:focus-visible` (accessibilité + audit RGAA).
- **Pas d'animation gratuite** : si l'animation n'aide pas l'utilisateur à
  comprendre quelque chose, elle dégage.

---

## 7. Accessibilité — non négociable

- Contraste **AA** minimum sur tout le texte (vérifier les passages `--muted` sur
  `--surface` : le ratio passe à peine, donc à réserver aux libellés petits).
- Tous les boutons icônes ont `aria-label`.
- Tous les toggles ont `aria-pressed` + `aria-label` qui décrit l'**effet** du
  clic ("Afficher la vue chiffrée").
- Tous les graphiques ont `role="img"` + `aria-label` descriptif.
- Composants `<details>` : utiliser le pattern natif, pas un `<button>` custom
  avec `aria-expanded` (sauf si la sémantique l'exige).
- Lecture clavier complète : ouvre n'importe quelle page, fais `Tab` du début à
  la fin, **rien ne doit échapper au focus**.

---

## 8. Tonalité copy / langue

- **Tutoiement** dans l'app et la landing (cible alternance / jeune cadre).
- **Phrases courtes** (≤ 18 mots). Si la phrase doit faire 30 mots, on coupe en
  deux.
- **Verbes d'action** dans les CTA (`Voir mes offres`, `Mes candidatures`,
  `Réserver l'audit`).
- **Pas de jargon technique** côté utilisateur (jamais "API", "endpoint",
  "overlay", "dataset", "demo data" exposé brut). Le terme "Exemple" est OK,
  affiché en pastille discrète.
- **Honnêteté** : si une donnée est partiellement fictive (graphique de démo,
  preuve sociale en cours de collecte), on l'indique clairement. Aucune urgence
  artificielle, aucun chiffre inventé (cf README, axes d'amélioration #7).

---

## 9. Anti-patterns à bannir

| ❌ À éviter                               | ✅ Préférer                                            |
| ----------------------------------------- | ------------------------------------------------------ |
| Couleur en dur (`#fff`, `rgba(124,92,255,0.5)`) | Variable CSS du `:root` (s'adapte au thème light)|
| Forcer le thème dark au mépris du choix utilisateur | Respecter `[data-theme]` sur `<html>` (jamais d'override CSS qui ignore le thème) |
| Onglets classiques pour 2 modes           | Toggle iOS (`.dash-ios-switch`)                        |
| Ombre noire pure très marquée             | Combinaison `--shadow` + glow violet sur les CTA       |
| Tableau brut sans `font-variant-numeric`  | `tabular-nums` pour toute valeur chiffrée              |
| H3 imposants partout                      | Étiquette uppercase `--muted` + valeur en grand        |
| États vides "—" ou "Aucune donnée"        | Phrase humaine + chemin vers l'action suivante         |
| Multiples CTA primaires sur un même écran | 1 CTA primaire + 1 secondaire max                      |
| Animations > 0.3s ou agrandissement       | Transitions 0.12 – 0.18s, micro-élévation              |
| Texte "—" comme placeholder               | Texte explicite ("À planifier", "Bientôt disponible")  |

---

## 10. Checklist avant de merger un changement UI

- [ ] J'ai relu **§1 vision** et **§9 anti-patterns**.
- [ ] Aucune couleur / radius / shadow en dur, tout passe par `globals.css`.
- [ ] Mes valeurs chiffrées utilisent `font-variant-numeric: tabular-nums`.
- [ ] Mon écran a au moins **un point d'ancrage violet** visible (CTA, badge, kicker).
- [ ] Je supporte mobile 375 × 667 (tout passe en colonne, CTA principal visible).
- [ ] `:focus-visible` actif partout, contrastes AA OK.
- [ ] États vides traités (pas d'écran "—" ou "Aucune donnée").
- [ ] Copy : tutoiement, phrases courtes, pas de jargon technique exposé.
- [ ] `npm run lint` et `npx tsc --noEmit` passent.
- [ ] Test de navigation clavier : `Tab` du début à la fin, rien ne saute.

---

## 11. Quand on s'éloigne (volontairement) de cette vision

Toute exception **doit** être :

1. **Documentée** ici (sous une nouvelle sous-section) avec la raison
   (contrainte technique, A/B test, demande explicite utilisateur).
2. **Datée**.
3. **Réversible** : prévoir le retour à la vision si l'exception ne paye pas.

Sinon, on accumule de la dette visuelle et on perd la cohérence qui fait la
valeur du produit.

---

*Dernière mise à jour : 3 mai 2026 — figé après la refonte du panneau
« Synthèse & offres » du dashboard et l'ajout du graphique avec décor fictif.*
