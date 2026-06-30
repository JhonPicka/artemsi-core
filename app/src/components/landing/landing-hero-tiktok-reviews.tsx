"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  LANDING_HERO_TIKTOK_REVIEWS,
  type LandingTikTokReview,
} from "@/lib/landing-tiktok-reviews";

const VISIBLE_COUNT_DESKTOP = 3;
const VISIBLE_COUNT_MOBILE = 1;
const AUTOPLAY_MS = 5500;
const MOBILE_MQ = "(max-width: 767px)";

function useVisibleCount() {
  const [visibleCount, setVisibleCount] = useState(VISIBLE_COUNT_MOBILE);

  // useLayoutEffect : synchrone avant le premier paint → pas de flash sur desktop
  useLayoutEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setVisibleCount(mq.matches ? VISIBLE_COUNT_MOBILE : VISIBLE_COUNT_DESKTOP);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return visibleCount;
}

function itemsForPage(page: number, reviews: LandingTikTokReview[], visibleCount: number) {
  const total = reviews.length;
  const start = ((page * visibleCount) % total + total) % total;
  return Array.from({ length: visibleCount }, (_, i) => reviews[(start + i) % total]);
}

function CommentCard({ review }: { review: LandingTikTokReview }) {
  return (
    <li className="landing-tiktok-comment">
      <Image
        src={review.imageSrc}
        alt={review.alt}
        width={review.imageWidth}
        height={review.imageHeight}
        className="landing-tiktok-comment-img"
        sizes="(max-width: 767px) 100vw, 33vw"
        quality={92}
      />
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Carousel infini — 3 commentaires visibles par cycle                  */
/* ------------------------------------------------------------------ */
export function LandingTikTokCommentsCarousel() {
  const reviews = LANDING_HERO_TIKTOK_REVIEWS;
  const visibleCount = useVisibleCount();
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const pauseUntil = useRef(0);

  const go = useCallback((dir: 1 | -1) => {
    pauseUntil.current = Date.now() + AUTOPLAY_MS;
    setDirection(dir);
    setPage((p) => p + dir);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() < pauseUntil.current) return;
      go(1);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [go]);

  const visible = itemsForPage(page, reviews, visibleCount);

  return (
    <div
      className="landing-tiktok-row"
      onMouseEnter={() => {
        pauseUntil.current = Date.now() + AUTOPLAY_MS * 2;
      }}
      onFocusCapture={() => {
        pauseUntil.current = Date.now() + AUTOPLAY_MS * 2;
      }}
    >
      <button
        type="button"
        className="landing-tiktok-row-nav landing-tiktok-row-nav--prev"
        aria-label="Commentaires précédents"
        onClick={() => go(-1)}
      >
        ←
      </button>

      <div className="landing-tiktok-row-viewport" aria-live="polite">
        <ul
          key={`${page}-${visibleCount}`}
          className={`landing-tiktok-row-track landing-tiktok-row-track--cycle landing-tiktok-row-track--from-${direction === 1 ? "next" : "prev"}`}
          data-visible={visibleCount}
          aria-label="Avis TikTok"
        >
          {visible.map((review) => (
            <CommentCard key={review.id} review={review} />
          ))}
        </ul>
      </div>

      <button
        type="button"
        className="landing-tiktok-row-nav landing-tiktok-row-nav--next"
        aria-label="Commentaires suivants"
        onClick={() => go(1)}
      >
        →
      </button>
    </div>
  );
}
