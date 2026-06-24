import type { OfferCardData } from "@/components/offers/offer-card";
import {
  getExternalOfferPlatformLabel,
  isExternalLinkOffer,
} from "@/lib/offer-external-link";

type OfferPlatformTagProps = {
  offer: Pick<OfferCardData, "url" | "source" | "is_partner_exclusive">;
};

export function OfferPlatformTag({ offer }: OfferPlatformTagProps) {
  if (!isExternalLinkOffer(offer)) return null;

  return (
    <span className="offer-tag offer-tag--platform">
      {getExternalOfferPlatformLabel(offer.url)}
    </span>
  );
}
