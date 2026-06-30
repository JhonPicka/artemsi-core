"use client";

import { useEffect, useState, type CSSProperties } from "react";

type Props = {
  durationMs?: number;
  onDone?: () => void;
};

const COLORS = ["#6548e8", "#8a73ff", "#0f7a53", "#ffb84a", "#bb2346", "#3ec488"];

type Piece = {
  id: number;
  style: CSSProperties;
};

function buildPieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const distance = 220 + Math.random() * 160;
    const cx = Math.cos(angle) * distance;
    const cy = Math.sin(angle) * distance;
    const cr = (Math.random() - 0.5) * 720;
    return {
      id: i,
      style: {
        background: COLORS[i % COLORS.length],
        animationDelay: `${Math.random() * 0.12}s`,
        ["--cx" as string]: `${cx}px`,
        ["--cy" as string]: `${cy}px`,
        ["--cr" as string]: `${cr}deg`,
      } as CSSProperties,
    };
  });
}

export function Celebration({ durationMs = 1500, onDone }: Props) {
  const [pieces] = useState(() => buildPieces(28));

  useEffect(() => {
    const timer = setTimeout(() => {
      onDone?.();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, onDone]);

  return (
    <div className="celebration-host" aria-hidden>
      {pieces.map((p) => (
        <span key={p.id} className="confetti-piece" style={p.style} />
      ))}
      <div className="celebration-badge" role="status" aria-live="polite">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <span className="celebration-title">Bravo, candidature acceptée !</span>
        <span className="celebration-sub">Une étape de plus vers ton alternance.</span>
      </div>
    </div>
  );
}
