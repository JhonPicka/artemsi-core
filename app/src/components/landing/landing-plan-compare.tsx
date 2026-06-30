"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { FreeCTAInterceptor } from "@/components/landing/landing-free-cta-interceptor";
import { SubscribeButton } from "@/components/billing/subscribe-button";
import {
  billingFreePlanMarketingFeatures,
  billingFreePlanTagline,
  billingMonthlyPriceLine,
  billingPlansSectionLead,
  billingPlansSectionTitle,
  billingProCtaLabel,
  billingProPlanMarketingFeatures,
  billingProPlanTagline,
  billingTrialShortLabel,
  type PlanMarketingFeature,
} from "@/lib/billing-offer";

type PlanCompareVariant = "landing" | "auth";

function CheckIcon({ muted }: { muted?: boolean }) {
  return (
    <svg
      className={`landing-plan-check${muted ? " landing-plan-check--muted" : ""}`}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      className="landing-plan-check landing-plan-check--cross"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlanFeatureList({ features }: { features: PlanMarketingFeature[] }) {
  return (
    <ul className="landing-plan-features">
      {features.map((feature) => (
        <li
          key={feature.label}
          className={`landing-plan-feature${feature.included ? "" : " landing-plan-feature--muted"}${feature.highlight ? " landing-plan-feature--highlight" : ""}`}
        >
          {feature.included ? <CheckIcon muted={!feature.highlight} /> : <CrossIcon />}
          <span>{feature.label}</span>
        </li>
      ))}
    </ul>
  );
}

function FreePlanCard({
  className,
}: {
  className?: string;
}) {
  return (
    <article className={`landing-plan-card landing-plan-card--free${className ? ` ${className}` : ""}`}>
      <p className="landing-plan-tier">Gratuit</p>
      <p className="landing-plan-price">
        <span className="landing-plan-price-amount">0 €</span>
      </p>
      <p className="landing-plan-tagline">{billingFreePlanTagline()}</p>
      <PlanFeatureList features={billingFreePlanMarketingFeatures()} />
      <FreeCTAInterceptor
        className="button-link secondary-link landing-plan-cta"
        showArrow={false}
      />
    </article>
  );
}

function ProPlanCard({ className }: { className?: string }) {
  return (
    <article
      className={`landing-plan-card landing-plan-card--pro landing-plan-card--featured${className ? ` ${className}` : ""}`}
    >
      <span className="landing-plan-badge">Recommandé</span>
      <p className="landing-plan-tier">Pro</p>
      <div className="landing-plan-pro-intro">
        <p className="landing-plan-trial">{billingTrialShortLabel()}</p>
        <p className="landing-plan-price">
          <span className="landing-plan-price-amount">{billingMonthlyPriceLine()}</span>
        </p>
        <p className="landing-plan-tagline">
          Prélèvement après l&apos;essai · {billingProPlanTagline()}
        </p>
      </div>
      <PlanFeatureList features={billingProPlanMarketingFeatures()} />
      <SubscribeButton className="button-link landing-cta-primary landing-plan-cta">
        {billingProCtaLabel()}
        <span className="landing-cta-arrow" aria-hidden="true">
          →
        </span>
      </SubscribeButton>
    </article>
  );
}

function MobilePlanCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFreeHint, setShowFreeHint] = useState(true);

  const scrollToFree = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".landing-plan-card--free");
    if (card) {
      el.scrollTo({ left: card.offsetLeft - 12, behavior: "smooth" });
    }
  }, []);

  const scrollToPro = useCallback(() => {
    scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, []);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowFreeHint(el.scrollLeft < el.clientWidth * 0.35);
  }, []);

  return (
    <div className="landing-plans-mobile">
      <div
        ref={scrollRef}
        className="landing-plans-mobile-scroll"
        onScroll={onScroll}
        aria-label="Comparer Gratuit et Pro"
      >
        <ProPlanCard className="landing-plan-card--slide" />
        <FreePlanCard className="landing-plan-card--slide" />
      </div>

      {showFreeHint ? (
        <button type="button" className="landing-plans-mobile-arrow" onClick={scrollToFree}>
          <span className="landing-plans-mobile-arrow-label">Gratuit</span>
          <span className="landing-plans-mobile-arrow-icon" aria-hidden="true">
            →
          </span>
        </button>
      ) : (
        <button
          type="button"
          className="landing-plans-mobile-arrow landing-plans-mobile-arrow--back"
          onClick={scrollToPro}
        >
          <span className="landing-plans-mobile-arrow-icon" aria-hidden="true">
            ←
          </span>
          <span className="landing-plans-mobile-arrow-label">Pro</span>
        </button>
      )}
    </div>
  );
}

function PlanCompareHead({ variant }: { variant: PlanCompareVariant }) {
  if (variant === "auth") {
    return (
      <div className="landing-section-head landing-plans-head auth-plan-compare-head">
        <span className="landing-kicker">Inscription</span>
        <h1 className="landing-section-title">Choisis ta formule</h1>
        <p className="landing-section-lead">
          Gratuit pour organiser ta recherche, Pro pour être accompagné.
        </p>
      </div>
    );
  }

  return (
    <div className="landing-section-head landing-plans-head">
      <span className="landing-kicker">Formules</span>
      <h2 id="landing-plans-title" className="landing-section-title">
        {billingPlansSectionTitle()}
      </h2>
      <p className="landing-section-lead">{billingPlansSectionLead()}</p>
    </div>
  );
}

function PlanCompareBody() {
  return (
    <>
      <div className="landing-plans-desktop" aria-label="Comparatif Gratuit et Pro">
        <FreePlanCard />
        <ProPlanCard />
      </div>
      <MobilePlanCarousel />
    </>
  );
}

type LandingPlanCompareProps = {
  variant?: PlanCompareVariant;
};

export function LandingPlanCompare({ variant = "landing" }: LandingPlanCompareProps) {
  if (variant === "auth") {
    return (
      <div className="auth-plan-compare">
        <PlanCompareHead variant="auth" />
        <PlanCompareBody />
        <p className="muted auth-plan-compare-footer">
          Déjà inscrit ?{" "}
          <Link href="/login" className="inline-link">
            Se connecter
          </Link>
        </p>
      </div>
    );
  }

  return (
    <section
      id="landing-prix"
      className="landing-section landing-plans landing-scroll-target"
      aria-labelledby="landing-plans-title"
    >
      <div className="landing-container">
        <PlanCompareHead variant="landing" />
        <PlanCompareBody />
      </div>
    </section>
  );
}
