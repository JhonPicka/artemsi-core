import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://artemsi.fr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Espaces privés / techniques : pas d'indexation.
      disallow: [
        "/api/",
        "/admin",
        "/dashboard",
        "/onboarding",
        "/checkout",
        "/auth/",
        "/signup/finish",
        "/activer-mon-compte",
        "/subscribe",
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
