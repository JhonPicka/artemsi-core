"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Ordre des ancres = ordre des sections dans la page (haut vers bas) */
const SECTION_ORDER = [
  "landing-accueil",
  "landing-candidatures",
  "landing-audit",
  "landing-faq",
  "landing-offres",
  "landing-prix",
] as const;

const NAV_LINKS: { id: (typeof SECTION_ORDER)[number]; label: string }[] = [
  { id: "landing-accueil", label: "Accueil" },
  { id: "landing-candidatures", label: "Candidatures" },
  { id: "landing-audit", label: "Audit" },
  { id: "landing-faq", label: "FAQ" },
  { id: "landing-offres", label: "Offres" },
  { id: "landing-prix", label: "Tarif" },
];

function isSectionId(value: string): value is (typeof SECTION_ORDER)[number] {
  return (SECTION_ORDER as readonly string[]).includes(value);
}

export function LandingTabs() {
  const [activeId, setActiveId] = useState<(typeof SECTION_ORDER)[number]>("landing-accueil");
  /** Apres un clic, on garde l'onglet clique souligne pendant le scroll fluide (evite le flicker). */
  const ignoreScrollSyncUntil = useRef(0);

  const updateActive = useCallback(() => {
    if (typeof performance !== "undefined" && performance.now() < ignoreScrollSyncUntil.current) {
      return;
    }

    const header = document.querySelector(".landing-nav");
    const offset = (header?.getBoundingClientRect().height ?? 72) + 24;
    const y = window.scrollY + offset;

    let current: (typeof SECTION_ORDER)[number] = "landing-accueil";
    for (const id of SECTION_ORDER) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (el.offsetTop <= y) current = id;
    }
    setActiveId(current);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      const hash = window.location.hash.replace(/^#/, "");
      if (isSectionId(hash)) setActiveId(hash);
      updateActive();
    });
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    window.addEventListener("hashchange", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
      window.removeEventListener("hashchange", updateActive);
    };
  }, [updateActive]);

  return (
    <nav className="tabs-nav landing-tabs-nav" aria-label="Navigation principale">
      {NAV_LINKS.map((item) => {
        const isActive = activeId === item.id;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`tab-link ${isActive ? "active" : ""}`}
            aria-current={isActive ? "page" : undefined}
            onClick={() => {
              setActiveId(item.id);
              ignoreScrollSyncUntil.current = performance.now() + 700;
            }}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
