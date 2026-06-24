import {
  detectOfferUrlPlatform,
  OFFER_URL_PLATFORM_LABELS,
  offerUrlHostShort,
} from "@/lib/admin-offer-url-platform";
import type { OfferCardData } from "@/components/offers/offer-card";

type ExternalLinkOffer = Pick<OfferCardData, "url" | "source" | "is_partner_exclusive">;

function isArtemsiHostedUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.includes("artemsi.fr");
  } catch {
    return false;
  }
}

/** Offre avec lien vers un site externe (HelloWork, Indeed, etc.), hors partenaires ARTEMSI. */
export function isExternalLinkOffer(offer: ExternalLinkOffer): boolean {
  const url = offer.url?.trim();
  if (!url) return false;
  if (offer.is_partner_exclusive || offer.source === "partner") return false;
  if (isArtemsiHostedUrl(url)) return false;
  return true;
}

export function getExternalOfferPlatformLabel(url: string): string {
  return OFFER_URL_PLATFORM_LABELS[detectOfferUrlPlatform(url)];
}

export function getExternalOfferHostShort(url: string): string {
  return offerUrlHostShort(url);
}

/** Remonte les offres à lien externe en tête de liste (ordre relatif conservé). */
export function prioritizeExternalLinkOffers<T extends ExternalLinkOffer>(
  offers: readonly T[],
): T[] {
  const external: T[] = [];
  const rest: T[] = [];

  for (const offer of offers) {
    if (isExternalLinkOffer(offer)) {
      external.push(offer);
    } else {
      rest.push(offer);
    }
  }

  return [...external, ...rest];
}

export function prioritizeItemsWithExternalLinkOffers<T>(
  items: readonly T[],
  pickOffer: (item: T) => ExternalLinkOffer,
): T[] {
  const external: T[] = [];
  const rest: T[] = [];

  for (const item of items) {
    if (isExternalLinkOffer(pickOffer(item))) {
      external.push(item);
    } else {
      rest.push(item);
    }
  }

  return [...external, ...rest];
}
