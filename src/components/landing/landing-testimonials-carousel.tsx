"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Testimonial = {
  id: string;
  initial: string;
  name: string;
  meta: string;
  via: string;
  quote: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: "thomas",
    initial: "T",
    name: "Thomas L.",
    meta: "BUT informatique",
    via: "Alternance signée",
    quote:
      "« En BUT informatique, je postulais au hasard. Les offres proposées collaient enfin au dev / data, et après un RDV d'accompagnement j'ai structuré mon CV et mes projets GitHub. Alternance signée chez un éditeur SaaS en un peu plus d'un mois. »",
  },
  {
    id: "camille",
    initial: "C",
    name: "Camille D.",
    meta: "École de commerce",
    via: "Stage trouvé",
    quote:
      "« En école de commerce (M1), je cherchais un stage marketing. ARTEMSI m'a évité les annonces hors sujet : offres ciblées, suivi des relances et retours concrets sur ma lettre. Stage de 6 mois en communication digitale, obtenu après plusieurs entretiens. »",
  },
];

const SCROLL_EDGE_THRESHOLD = 12;

function scrollTrack(track: HTMLUListElement, direction: -1 | 1) {
  const card = track.querySelector<HTMLElement>(".landing-testimonial");
  const gap = Number.parseFloat(getComputedStyle(track).gap) || 16;
  const step = (card?.offsetWidth ?? track.clientWidth) + gap;
  track.scrollBy({ left: direction * step, behavior: "smooth" });
}

export function LandingTestimonialsCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);
  const hasMultiple = TESTIMONIALS.length > 1;
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track || !hasMultiple) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }

    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= SCROLL_EDGE_THRESHOLD) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }

    setCanScrollPrev(track.scrollLeft > SCROLL_EDGE_THRESHOLD);
    setCanScrollNext(track.scrollLeft < maxScroll - SCROLL_EDGE_THRESHOLD);
  }, [hasMultiple]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateScrollState();

    track.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateScrollState)
        : null;
    observer?.observe(track);

    return () => {
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      observer?.disconnect();
    };
  }, [updateScrollState]);

  const showControls = hasMultiple && (canScrollPrev || canScrollNext);

  return (
    <div className="landing-testimonials-carousel">
      <ul ref={trackRef} className="landing-testimonials">
        {TESTIMONIALS.map((item) => (
          <li key={item.id} className="landing-testimonial">
            <div
              className="landing-testimonial-stars"
              aria-label="Note 5 sur 5"
              title="5 sur 5"
            >
              <span aria-hidden="true">★★★★★</span>
            </div>
            <blockquote className="landing-testimonial-quote">{item.quote}</blockquote>
            <p className="landing-testimonial-source">
              <span className="landing-testimonial-avatar" aria-hidden="true">
                {item.initial}
              </span>
              <span>
                <strong className="landing-testimonial-name">{item.name}</strong>
                <span className="landing-testimonial-meta">{item.meta}</span>
                <span className="landing-testimonial-via">{item.via}</span>
              </span>
            </p>
          </li>
        ))}
      </ul>

      {showControls ? (
        <div className="landing-testimonials-controls">
          {canScrollPrev ? (
            <button
              type="button"
              className="landing-testimonials-nav landing-testimonials-nav--prev"
              aria-label="Avis précédent"
              onClick={() => {
                const track = trackRef.current;
                if (track) scrollTrack(track, -1);
              }}
            >
              <span aria-hidden="true">←</span>
            </button>
          ) : null}
          {canScrollNext ? (
            <button
              type="button"
              className="landing-testimonials-nav landing-testimonials-nav--next"
              aria-label="Avis suivant"
              onClick={() => {
                const track = trackRef.current;
                if (track) scrollTrack(track, 1);
              }}
            >
              <span aria-hidden="true">→</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
