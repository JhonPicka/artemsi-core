/** Captures TikTok réelles — fichiers dans public/landing/tiktok/ */
export type LandingTikTokReview = {
  id: string;
  imageSrc: string;
  alt: string;
  imageWidth: number;
  imageHeight: number;
};

/**
 * Compte & tuto TikTok — optionnel via .env.local :
 * NEXT_PUBLIC_TIKTOK_HANDLE, NEXT_PUBLIC_TIKTOK_URL, NEXT_PUBLIC_TIKTOK_TUTORIAL_URL
 */
export const LANDING_TIKTOK = {
  handle: process.env.NEXT_PUBLIC_TIKTOK_HANDLE ?? "@artemsiapp",
  profileUrl: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "https://www.tiktok.com/@artemsiapp",
  profileImageSrc: "/landing/tiktok/profil-artemsiapp.png",
  tutorialVideoUrl: process.env.NEXT_PUBLIC_TIKTOK_TUTORIAL_URL ?? "",
} as const;

export function landingTikTokLink(): { href: string; label: string; hint: string } {
  if (LANDING_TIKTOK.tutorialVideoUrl.trim()) {
    return {
      href: LANDING_TIKTOK.tutorialVideoUrl.trim(),
      label: "Voir comment utiliser l'app sur TikTok",
      hint: `Tutoriel · ${LANDING_TIKTOK.handle}`,
    };
  }

  return {
    href: LANDING_TIKTOK.profileUrl,
    label: `Suivre ${LANDING_TIKTOK.handle} sur TikTok`,
    hint: "Tuto « comment utiliser ARTEMSI » bientôt en ligne",
  };
}

/** Commentaires TikTok — ordre : alternance Safran en premier */
export const LANDING_HERO_TIKTOK_REVIEWS: LandingTikTokReview[] = [
  {
    id: "mh-safran",
    imageSrc: "/landing/tiktok/avis-mh-safran.png",
    alt: "Commentaire TikTok : alternance trouvée chez Safran grâce à ARTEMSI",
    imageWidth: 1024,
    imageHeight: 342,
  },
  {
    id: "aylisx21",
    imageSrc: "/landing/tiktok/avis-aylisx21.png",
    alt: "Commentaire TikTok : plusieurs entretiens après les conseils ARTEMSI",
    imageWidth: 1024,
    imageHeight: 343,
  },
  {
    id: "rgvr",
    imageSrc: "/landing/tiktok/avis-rgvr.png",
    alt: "Commentaire TikTok : alternance trouvée, merci à artemsi",
    imageWidth: 1024,
    imageHeight: 248,
  },
  {
    id: "moustaga",
    imageSrc: "/landing/tiktok/avis-moustaga.png",
    alt: "Commentaire TikTok : rapidité et efficacité d'ARTEMSI",
    imageWidth: 1024,
    imageHeight: 229,
  },
  {
    id: "ragebaitime",
    imageSrc: "/landing/tiktok/avis-ragebaitime.png",
    alt: "Commentaire TikTok : retour positif sur ARTEMSI",
    imageWidth: 1024,
    imageHeight: 308,
  },
];
