import Link from "next/link";
import type { ReactNode } from "react";

import { legalConfig, legalRoutes } from "@/lib/legal-config";

type Props = {
  title: string;
  children: ReactNode;
  active?: "mentions" | "privacy" | "terms";
};

export function LegalPageShell({ title, children, active }: Props) {
  const nav = [
    { id: "mentions" as const, href: legalRoutes.mentions, label: "Mentions légales" },
    { id: "privacy" as const, href: legalRoutes.privacy, label: "Confidentialité" },
    { id: "terms" as const, href: legalRoutes.terms, label: "CGU & CGV" },
  ];

  return (
    <main className="legal-page">
      <div className="legal-page-inner">
        <header className="legal-page-head">
          <Link href="/" className="legal-page-back">
            ← Retour à l&apos;accueil
          </Link>
          <p className="legal-page-brand">{legalConfig.brand}</p>
          <h1 className="legal-page-title">{title}</h1>
          <p className="muted legal-page-updated">
            Dernière mise à jour : {legalConfig.lastUpdated}
          </p>
          <nav className="legal-page-nav" aria-label="Documents légaux">
            {nav.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={active === item.id ? "is-active" : undefined}
                aria-current={active === item.id ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <article className="legal-prose card">{children}</article>

        <p className="muted legal-page-note">
          Document opposable pour l&apos;utilisation du service {legalConfig.brand}. Pour toute
          question :{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a>.
        </p>
      </div>
    </main>
  );
}
