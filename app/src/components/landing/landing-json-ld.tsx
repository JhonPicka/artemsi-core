import { legalConfig } from "@/lib/legal-config";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://artemsi.fr";

/**
 * Données structurées Schema.org pour le référencement (Google rich results).
 * Organization + WebSite sur la landing.
 */
export function LandingJsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${APP_URL}/#organization`,
        name: "ARTEMSI",
        url: APP_URL,
        logo: `${APP_URL}/artemsi-logo.png`,
        email: legalConfig.contactEmail,
        description:
          "Plateforme d'alternance en ingénierie et industrie : offres ciblées sur ton profil, suivi des candidatures et accompagnement humain.",
      },
      {
        "@type": "WebSite",
        "@id": `${APP_URL}/#website`,
        url: APP_URL,
        name: "ARTEMSI",
        publisher: { "@id": `${APP_URL}/#organization` },
        inLanguage: "fr-FR",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // JSON contrôlé (aucune donnée utilisateur) : sérialisation sûre.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
