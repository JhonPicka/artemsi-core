import Link from "next/link";
import type { ReactNode } from "react";

import { legalConfig } from "@/lib/legal-config";

type Props = {
  children: ReactNode;
};

export function AuthPageShell({ children }: Props) {
  return (
    <main className="centered-page auth-page">
      <Link href="/" className="auth-page-back">
        ← Retour à {legalConfig.publicSiteLabel}
      </Link>
      {children}
    </main>
  );
}
