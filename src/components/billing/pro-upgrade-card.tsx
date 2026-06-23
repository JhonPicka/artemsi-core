import Link from "next/link";

import { SubscribeButton } from "@/components/billing/subscribe-button";
import { billingProCtaLabel, billingProTrialLine } from "@/lib/billing-offer";

type ProUpgradeCardProps = {
  title: string;
  description: string;
};

export function ProUpgradeCard({ title, description }: ProUpgradeCardProps) {
  return (
    <section className="card pro-upgrade-card">
      <span className="brand-chip">PRO</span>
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      <p className="muted pro-upgrade-card-trial">{billingProTrialLine()}</p>
      <div className="pro-upgrade-card-actions">
        <SubscribeButton className="button-link">{billingProCtaLabel()}</SubscribeButton>
        <Link href="/subscribe" className="button-link secondary-link">
          Voir les détails
        </Link>
      </div>
    </section>
  );
}
