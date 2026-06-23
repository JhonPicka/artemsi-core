import Link from "next/link";

import {
  buildOffersHref,
  type OffersView,
} from "@/lib/offers-dashboard";

type OffersViewTabsProps = {
  active: OffersView;
  counts: {
    personal: number;
    exclusive: number;
    jobboard: number;
  };
};

const TABS: { id: OffersView; label: string; countKey: keyof OffersViewTabsProps["counts"] }[] = [
  { id: "pour-moi", label: "Pour moi", countKey: "personal" },
  { id: "partenaires", label: "Partenaires", countKey: "exclusive" },
  { id: "jobboard", label: "Jobboard", countKey: "jobboard" },
];

export function OffersViewTabs({ active, counts }: OffersViewTabsProps) {
  return (
    <nav className="offers-view-tabs" aria-label="Sections offres">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        const count = counts[tab.countKey];

        return (
          <Link
            key={tab.id}
            href={buildOffersHref({ view: tab.id })}
            className={`offers-view-tab${isActive ? " is-active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span>{tab.label}</span>
            <span className="offers-view-tab-count" aria-label={`${count} offres`}>
              {count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
