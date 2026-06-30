/**
 * Informations légales — source unique pour Mentions / Confidentialité / CGU.
 */
export const legalConfig = {
  brand: "ARTEMSI",
  contactEmail: "contact@artemsi.fr",
  publicSiteUrl: "https://artemsi.fr",
  publicSiteLabel: "artemsi.fr",
  /** URL de l'application candidat (variable d'environnement en prod). */
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  publisherName: "EL-PICKA Jhon-Jhon",
  legalForm: "Auto-entrepreneur",
  companyId: "988 417 291 00016",
  companyIdLabel: "SIRET",
  registeredAddress: "44 avenue de la Renaissance, Goussainville",
  publicationDirector: "PICKA Jhon-Jhon",

  hostName: "IONOS",
  hostAddress: "44 avenue de la Renaissance, Goussainville",

  lastUpdated: "21 juin 2026",
} as const;

export const legalRoutes = {
  mentions: "/mentions-legales",
  privacy: "/confidentialite",
  terms: "/cgu",
} as const;
