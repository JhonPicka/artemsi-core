import Image from "next/image";

import { LANDING_TIKTOK } from "@/lib/landing-tiktok-reviews";

/** Colonne droite du hero desktop — photo profil TikTok ARTEMSI */
export function LandingHeroVisualPanel() {
  return (
    <div className="landing-hero-visual-panel landing-hero-tiktok-panel" aria-label="Compte TikTok ARTEMSI">
      <a
        href={LANDING_TIKTOK.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="landing-hero-tiktok-link"
        aria-label={`Voir le compte TikTok ${LANDING_TIKTOK.handle}`}
      >
        <Image
          src={LANDING_TIKTOK.profileImageSrc}
          alt={`Compte TikTok ${LANDING_TIKTOK.handle}`}
          width={227}
          height={288}
          className="landing-hero-tiktok-img"
          priority
        />
      </a>
    </div>
  );
}

