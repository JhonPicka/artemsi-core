<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ARTEMSI — règles UI / design (à lire avant toute modif visuelle)

**Toute modification de `app/src/app/**/*.tsx`, `app/src/components/**` ou
`app/src/app/globals.css` doit respecter `../docs/design-system.md`.**

Avant d'écrire du JSX ou du CSS :

1. Ouvrir [`../docs/design-system.md`](../../docs/design-system.md) en entier
   (vision, tokens, composants signature, anti-patterns, checklist).
2. Réutiliser les patterns existants (`.dash-card--panel`, `.dash-panel`,
   `.dash-ios-switch`, `.dash-stat-chip`, `.dash-pipeline`, `.dash-hero`, etc.)
   plutôt que créer une variante.
3. Passer par les **variables CSS** de `:root` dans `globals.css` — pas de
   couleur, rayon, ombre en dur.
4. Garder la sortie **dark first**, accent violet `--primary`, valeurs chiffrées
   en `font-variant-numeric: tabular-nums`.
5. Vérifier la checklist du §10 du design system **avant de proposer le diff**.

Si une décision visuelle s'écarte volontairement de la vision, la documenter
dans `docs/design-system.md` (§11) avec date + raison.
