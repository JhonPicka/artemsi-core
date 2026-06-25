import type { ReactNode } from "react";

import { AdminOffersSubnav } from "@/components/admin/admin-offers-subnav";

export default function AdminOffersLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-offers-layout">
      <div className="admin-offers-subnav-scroll">
        <AdminOffersSubnav />
      </div>
      {children}
    </div>
  );
}
