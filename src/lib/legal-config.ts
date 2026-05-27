/**
 * Informations légales — source unique pour Mentions / Confidentialité / CGU.
 */
const FALLBACK_APP_URL = "http://localhost:3000";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? FALLBACK_APP_URL;
const APP_LABEL = APP_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");

export const legalConfig = {
  brand: "ARTEMSI",
  contactEmail: "contact@artemsi.fr",
  /** URL publique du site (landing + app, même domaine en production). */
  publicSiteUrl: APP_URL,
  publicSiteLabel: APP_LABEL,
  /** URL de l'application candidat (variable d'environnement en prod). */
  appUrl: APP_URL,

  publisherName: "EL-PICKA Jhon-Jhon",
  legalForm: "Auto-entrepreneur",
  companyId: "988 417 291 00016",
  companyIdLabel: "SIRET",
  registeredAddress: "44 avenue de la Renaissance, Goussainville",
  publicationDirector: "PICKA Jhon-Jhon",

  hostName: "Vercel Inc.",
  hostAddress: "440 N Barranca Ave #4133, Covina, CA 91723, USA",

  lastUpdated: "20 mai 2026",
} as const;

export const legalRoutes = {
  mentions: "/mentions-legales",
  privacy: "/confidentialite",
  terms: "/cgu",
} as const;
