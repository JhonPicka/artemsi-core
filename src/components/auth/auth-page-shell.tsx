import Link from "next/link";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/brand/brand-mark";
import { legalConfig } from "@/lib/legal-config";

type Props = {
  children: ReactNode;
};

export function AuthPageShell({ children }: Props) {
  return (
    <main className="centered-page auth-page">
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
