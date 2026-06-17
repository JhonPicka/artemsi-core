"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  if (href === "/admin/audits") {
    return pathname === href || pathname.startsWith("/admin/audit");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

const LINKS = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/offres", label: "Offres", exact: false },
  { href: "/admin/audits", label: "Audits", exact: false },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-top-links" aria-label="Navigation admin">
      {LINKS.map((link) => {
        const active = isActive(pathname, link.href, link.exact);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "admin-top-links__item is-active" : "admin-top-links__item"}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
