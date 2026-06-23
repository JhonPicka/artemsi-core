import Link from "next/link";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/brand/brand-mark";
import { legalConfig } from "@/lib/legal-config";

type Props = {
  children: ReactNode;
  /** Page entrée (login) avec comparatif Gratuit / Pro */
  wide?: boolean;
};

export function AuthPageShell({ children, wide = false }: Props) {
  return (
    <main className={`centered-page auth-page${wide ? " auth-page--entry" : ""}`}>
      <header className="auth-page-header">
        <BrandMark href="/" size={40} logoClassName="brand-logo landing-brand-logo" />
        <Link href="/" className="auth-page-back">
          ← Retour à {legalConfig.publicSiteLabel}
        </Link>
      </header>
      {children}
    </main>
  );
}
