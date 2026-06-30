"use client";

import { useMemo, useState } from "react";

import {
  getLandingDemoVideoEmbed,
  LANDING_DEMO_VIDEO,
} from "@/lib/landing-demo-video";

function PlayIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v14.72a1 1 0 0 0 1.5.86l11.01-7.36a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14z" />
    </svg>
  );
}

function ExamplePreview() {
  return (
    <div className="landing-app-video-example" aria-hidden="true">
      <div className="landing-app-video-browser">
        <span />
        <span />
        <span />
        <p>artemsi.fr · espace candidat</p>
      </div>
      <div className="landing-app-video-mock">
        <div className="landing-app-video-mock-panel landing-app-video-mock-panel--offers">
          <span className="landing-app-video-mock-kicker">Offres pour toi</span>
          <span className="landing-app-video-mock-line landing-app-video-mock-line--wide" />
          <span className="landing-app-video-mock-line" />
          <span className="landing-app-video-mock-line landing-app-video-mock-line--short" />
        </div>
        <div className="landing-app-video-mock-panel landing-app-video-mock-panel--tracker">
          <span className="landing-app-video-mock-kicker">Suivi</span>
          <span className="landing-app-video-mock-pill landing-app-video-mock-pill--sent" />
          <span className="landing-app-video-mock-pill landing-app-video-mock-pill--wait" />
          <span className="landing-app-video-mock-pill landing-app-video-mock-pill--reply" />
        </div>
        <div className="landing-app-video-mock-panel landing-app-video-mock-panel--chart">
          <span className="landing-app-video-mock-kicker">Progression</span>
          <span className="landing-app-video-mock-bars">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
      </div>
    </div>
  );
}

export function LandingAppVideo() {
  const embed = useMemo(
    () => getLandingDemoVideoEmbed(LANDING_DEMO_VIDEO.url),
    [],
  );
  const [playing, setPlaying] = useState(false);
  const isExample = !embed;
  const showPlayer = playing && embed;

  return (
    <div className="landing-app-video-wrap" data-has-video={embed ? "true" : "false"}>
      <div className="landing-app-video">
        {showPlayer ? (
          <div className="landing-app-video-player">
            {embed.kind === "file" ? (
              <video
                className="landing-app-video-media"
                src={embed.src}
                controls
                playsInline
                preload="metadata"
                title={LANDING_DEMO_VIDEO.title}
              />
            ) : (
              <iframe
                className="landing-app-video-media"
                src={`${embed.embedUrl}&autoplay=1`}
                title={LANDING_DEMO_VIDEO.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>
        ) : (
          <button
            type="button"
            className="landing-app-video-trigger"
            onClick={() => {
              if (embed) setPlaying(true);
            }}
            aria-label={
              embed
                ? `Lire la vidéo : ${LANDING_DEMO_VIDEO.title}`
                : `Aperçu vidéo : ${LANDING_DEMO_VIDEO.title}`
            }
          >
            <ExamplePreview />
            <span className="landing-app-video-play" aria-hidden="true">
              <PlayIcon />
            </span>
            <span className="landing-app-video-badge">
              {isExample ? "Exemple" : "Vidéo"}
            </span>
            <span className="landing-app-video-meta">
              <strong>{LANDING_DEMO_VIDEO.title}</strong>
              <span>{LANDING_DEMO_VIDEO.durationLabel}</span>
            </span>
          </button>
        )}
      </div>
      {isExample ? (
        <p className="landing-app-video-hint">
          Vidéo de démonstration bientôt en ligne — le tour complet de l&apos;espace candidat.
        </p>
      ) : null}
    </div>
  );
}
