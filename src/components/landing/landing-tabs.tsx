"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Ordre des ancres = ordre des sections dans la page (haut vers bas) */
const SECTION_ORDER = [
  "landing-accueil",
  "landing-candidatures",
  "landing-apercu",
  "landing-audit",
  "landing-prix",
  "landing-faq",
] as const;

const NAV_LINKS: { id: (typeof SECTION_ORDER)[number]; label: string }[] = [
  { id: "landing-candidatures", label: "Comment ça marche" },
  { id: "landing-apercu", label: "L'espace" },
  { id: "landing-audit", label: "Accompagnement" },
  { id: "landing-prix", label: "Formules" },
  { id: "landing-faq", label: "FAQ" },
];

const NAV_IDS = NAV_LINKS.map((item) => item.id);

const NAV_SCROLL_GAP = -30;

type SectionId = (typeof SECTION_ORDER)[number];

function isSectionId(value: string): value is SectionId {
  return (SECTION_ORDER as readonly string[]).includes(value);
}

function getNavScrollOffset() {
  const header = document.querySelector(".landing-nav");
  return (header?.getBoundingClientRect().height ?? 72) + NAV_SCROLL_GAP;
}

function getSectionHead(section: HTMLElement) {
  return section.querySelector<HTMLElement>(".landing-section-head") ?? section;
}

function scrollSectionToTop(id: SectionId) {
  const section = document.getElementById(id);
  if (!section) return;

  const head = getSectionHead(section);
  const headTop = head.getBoundingClientRect().top + window.scrollY;
  const targetScroll = headTop - getNavScrollOffset();

  window.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
}

export function LandingTabs() {
  const [activeId, setActiveId] = useState<SectionId>("landing-accueil");
  /** Apres un clic, on garde l'onglet clique souligne pendant le scroll fluide (evite le flicker). */
  const ignoreScrollSyncUntil = useRef(0);

  const updateActive = useCallback(() => {
    if (typeof performance !== "undefined" && performance.now() < ignoreScrollSyncUntil.current) {
      return;
    }

    const offset = getNavScrollOffset();
    const markerY = window.scrollY + offset;

    let current: SectionId = "landing-accueil";
    for (const id of NAV_IDS) {
      const section = document.getElementById(id);
      if (!section) continue;
      const head = getSectionHead(section);
      const headTop = head.getBoundingClientRect().top + window.scrollY;
      if (headTop <= markerY) current = id;
    }

    setActiveId(current);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      const hash = window.location.hash.replace(/^#/, "");
      if (isSectionId(hash) && NAV_IDS.includes(hash as (typeof NAV_IDS)[number])) {
        setActiveId(hash);
        requestAnimationFrame(() => scrollSectionToTop(hash));
      } else {
        updateActive();
      }
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
            onClick={(event) => {
              event.preventDefault();
              setActiveId(item.id);
              ignoreScrollSyncUntil.current = performance.now() + 900;
              scrollSectionToTop(item.id);
              window.history.pushState(null, "", `#${item.id}`);
            }}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
