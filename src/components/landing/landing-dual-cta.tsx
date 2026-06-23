import { FreeCTAInterceptor } from "@/components/landing/landing-free-cta-interceptor";
import { SubscribeButton } from "@/components/billing/subscribe-button";
import { billingProCtaLabel } from "@/lib/billing-offer";

type Props = {
  className?: string;
};

export function LandingDualCta({ className = "landing-cta-row" }: Props) {
  return (
    <div className={className}>
      <SubscribeButton className="button-link landing-cta-primary landing-cta-primary--pro">
        {billingProCtaLabel()}
        <span className="landing-cta-arrow" aria-hidden="true">→</span>
      </SubscribeButton>
      <FreeCTAInterceptor
        className="button-link secondary-link landing-cta-free"
        showArrow
      />
    </div>
  );
}
