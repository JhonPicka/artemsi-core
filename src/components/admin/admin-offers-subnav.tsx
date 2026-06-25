"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/offres", label: "Toutes les offres", exact: true },
  { href: "/admin/offres/nouvelle", label: "Nouvelle offre", exact: true },
  { href: "/admin/offres/import", label: "Import CSV", exact: true },
  { href: "/admin/offres/distribution", label: "Distribution", exact: true },
  { href: "/admin/offres/matching", label: "Matching", exact: true },
] as const;

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminOffersSubnav() {
  const pathname = usePathname();

  return (
    <nav className="admin-offers-subnav" aria-label="Sous-navigation offres">
      {LINKS.map((link) => {
        const active = isActive(pathname, link.href, link.exact);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              active ? "admin-offers-subnav__item is-active" : "admin-offers-subnav__item"
            }
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
