"use client";

import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";

type Props = {
  logoutForm: ReactNode;
};

export function AdminHeaderActions({ logoutForm }: Props) {
  return (
    <div className="top-nav-actions">
      <ThemeToggle variant="compact" className="theme-toggle--admin" />
      {logoutForm}
    </div>
  );
}
