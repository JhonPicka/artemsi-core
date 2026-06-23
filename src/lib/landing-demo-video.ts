export const LANDING_DEMO_VIDEO = {
  /** YouTube, Vimeo ou fichier .mp4 / .webm — voir .env.example */
  url: process.env.NEXT_PUBLIC_LANDING_DEMO_VIDEO_URL?.trim() ?? "",
  title: "Visite de l'espace candidat ARTEMSI",
  durationLabel: "~2 min",
} as const;

export type LandingDemoVideoEmbed =
  | { kind: "youtube"; embedUrl: string }
  | { kind: "vimeo"; embedUrl: string }
  | { kind: "file"; src: string };

export function getLandingDemoVideoEmbed(url: string): LandingDemoVideoEmbed | null {
  const raw = url.trim();
  if (!raw) return null;

  if (/\.(mp4|webm)(\?|$)/i.test(raw)) {
    return { kind: "file", src: raw };
  }

  try {
    const parsed = new URL(raw);

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace(/^\//, "").split("/")[0];
      if (id) {
        return {
          kind: "youtube",
          embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`,
        };
      }
    }

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) {
        return {
          kind: "youtube",
          embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`,
        };
      }

      const embedMatch = parsed.pathname.match(/\/embed\/([^/?]+)/);
      if (embedMatch?.[1]) {
        return {
          kind: "youtube",
          embedUrl: `https://www.youtube-nocookie.com/embed/${embedMatch[1]}?rel=0&modestbranding=1`,
        };
      }
    }

    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.replace(/^\//, "").split("/").filter(Boolean).pop();
      if (id && /^\d+$/.test(id)) {
        return {
          kind: "vimeo",
          embedUrl: `https://player.vimeo.com/video/${id}?title=0&byline=0`,
        };
      }
    }
  } catch {
    return null;
  }

  return null;
}
