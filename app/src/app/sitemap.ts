import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://artemsi.fr";

/** Pages publiques indexables (la landing + accès compte + légal). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  ): MetadataRoute.Sitemap[number] => ({
    url: `${APP_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    entry("/", 1, "weekly"),
    entry("/login", 0.5, "yearly"),
    entry("/signup", 0.8, "monthly"),
    entry("/cgu", 0.3, "yearly"),
    entry("/confidentialite", 0.3, "yearly"),
    entry("/mentions-legales", 0.3, "yearly"),
  ];
}
