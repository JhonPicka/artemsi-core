import type { OfferCardData } from "@/components/offers/offer-card";

type OfferStatus = "sent" | "seen" | "applied" | "archived";

export type AssignmentEmbedRow = {
  status: OfferStatus;
  assigned_at: string;
  offer?: OfferCardData | null;
  offers?: OfferCardData | OfferCardData[] | null;
};

/** PostgREST peut renvoyer `offers` (nom de table) ou `offer` (alias) ; parfois un tableau. */
export function offerFromAssignmentEmbed(row: AssignmentEmbedRow): OfferCardData | null {
  if (row.offer) return row.offer;
  const nested = row.offers;
  if (Array.isArray(nested)) return nested[0] ?? null;
  if (nested && typeof nested === "object") return nested;
  return null;
}

const DEMO_URL = "https://artemsi.fr";

export const DEMO_PERSONAL_ASSIGNMENTS: { status: OfferStatus; offer: OfferCardData }[] = [
  {
    status: "sent",
    offer: {
      id: "demo-perso-1",
      title: "Assistant·e marketing digital (exemple)",
      company: "Agence Lumière",
      location: "Paris · Hybride",
      description:
        "Infos clés\n• Lieu : Paris, rythme hybride\n• Contrat : alternance\n\nMissions principales\n• Participer aux campagnes marketing digital\n• Suivre les performances social media\n• Aider à la création de contenus\n\nProfil recherché\n• Formation marketing ou communication\n• Première expérience appréciée",
      url: DEMO_URL,
      source: "partner",
      is_partner_exclusive: false,
    },
  },
  {
    status: "seen",
    offer: {
      id: "demo-perso-2",
      title: "Chargé·e de communication junior (exemple)",
      company: "Collectif Hélice",
      location: "Lyon",
      description:
        "Infos clés\n• Lieu : Lyon\n• Contrat : alternance\n\nMissions principales\n• Préparer les contenus de communication\n• Mettre à jour les supports de marque\n• Suivre le calendrier éditorial\n\nProfil recherché\n• Aisance rédactionnelle\n• Organisation et curiosité digitale",
      url: DEMO_URL,
      source: "autre",
      is_partner_exclusive: false,
    },
  },
];

export const DEMO_EXCLUSIVE_ASSIGNMENTS: { status: OfferStatus; offer: OfferCardData }[] = [
  {
    status: "sent",
    offer: {
      id: "demo-exclu-1",
      title: "Alternance data — secteur retail (exemple)",
      company: "ARTEMSI × Partenaire",
      location: "Nantes",
      description:
        "Infos clés\n• Lieu : Nantes\n• Contrat : alternance\n\nMissions principales\n• Construire des tableaux de bord data\n• Nettoyer et analyser des données retail\n• Présenter les indicateurs clés à l'équipe\n\nProfil recherché\n• Formation data, business intelligence ou marketing analytique\n• Bases SQL ou tableur avancé",
      url: DEMO_URL,
      source: "partner",
      is_partner_exclusive: true,
    },
  },
];

export const DEMO_JOBBOARD: OfferCardData[] = [
  {
    id: "demo-public-1",
    title: "Stage ou alternance — design produit (exemple)",
    company: "Atelier Nova",
    location: "Bordeaux",
    description:
      "Infos clés\n• Lieu : Bordeaux\n• Contrat : stage ou alternance\n\nMissions principales\n• Participer à la conception d'interfaces\n• Préparer des maquettes et prototypes\n• Contribuer aux tests utilisateurs\n\nProfil recherché\n• Sensibilité UX/UI\n• Portfolio ou projets école appréciés",
    url: DEMO_URL,
    source: "autre",
    is_partner_exclusive: false,
  },
  {
    id: "demo-public-2",
    title: "Business developer junior (exemple)",
    company: "Scale-up Flow",
    location: "Remote France",
    description:
      "Infos clés\n• Lieu : France, remote\n• Contrat : alternance\n\nMissions principales\n• Identifier de nouveaux prospects\n• Participer aux campagnes outbound\n• Suivre les opportunités commerciales\n\nProfil recherché\n• Appétence vente et relation client\n• Bon niveau d'organisation",
    url: DEMO_URL,
    source: "autre",
    is_partner_exclusive: false,
  },
];
