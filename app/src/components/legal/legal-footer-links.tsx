import Link from "next/link";

import { legalRoutes } from "@/lib/legal-config";

export function LegalFooterLinks() {
  return (
    <>
      <Link href={legalRoutes.mentions}>Mentions légales</Link>
      <Link href={legalRoutes.privacy}>Confidentialité</Link>
      <Link href={legalRoutes.terms}>CGU & CGV</Link>
    </>
  );
}
