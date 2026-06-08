import type { ReactNode } from "react";
import { logoutAction } from "@/app/(auth)/actions";
import { AdminHeaderActions } from "@/components/admin/admin-header-actions";
import { BrandMark } from "@/components/brand/brand-mark";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdminUser } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  await requireAdminUser();

  const logoutForm = (
    <form action={logoutAction} className="top-nav-logout">
      <button type="submit" className="logout-button">
        Deconnexion
      </button>
    </form>
  );

  return (
    <main className="page-shell page-shell--wide page-shell--admin">
      <header className="top-nav top-nav--admin">
        <BrandMark href="/admin" label="ARTEMSI Admin" />
        <AdminNav />
        <AdminHeaderActions logoutForm={logoutForm} />
      </header>

      <div className="admin-page-content">{children}</div>
    </main>
  );
}
