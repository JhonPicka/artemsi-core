"use client";

import { useRef } from "react";

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

function scrollTrack(track: HTMLUListElement, direction: -1 | 1) {
  const card = track.querySelector<HTMLElement>(".landing-testimonial");
  const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 16;
  const step = (card?.offsetWidth ?? track.clientWidth * 0.85) + gap;
  track.scrollBy({ left: direction * step, behavior: "smooth" });
}

export function LandingTestimonialsCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);

  return (
    <div className="landing-testimonials-carousel">
      <button
        type="button"
        className="landing-testimonials-nav landing-testimonials-nav--prev"
        aria-label="Avis précédents"
        onClick={() => {
          const track = trackRef.current;
          if (track) scrollTrack(track, -1);
        }}
      >
        <span aria-hidden="true">←</span>
      </button>

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

      <button
        type="button"
        className="landing-testimonials-nav landing-testimonials-nav--next"
        aria-label="Avis suivants"
        onClick={() => {
          const track = trackRef.current;
          if (track) scrollTrack(track, 1);
        }}
      >
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
