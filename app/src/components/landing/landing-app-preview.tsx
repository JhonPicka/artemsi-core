import { LandingAppVideo } from "@/components/landing/landing-app-video";
import { LandingApplicationChartDemo } from "@/components/landing/landing-application-chart-demo";
import { LandingApplicationTrackerDemo } from "@/components/landing/landing-application-tracker-demo";
import { LandingOfferCardsPreview } from "@/components/landing/landing-offer-cards-preview";

export function LandingAppPreview({ className = "" }: { className?: string }) {
  return (
    <section
      id="landing-apercu"
      className={`landing-section landing-app-preview landing-scroll-target${className ? ` ${className}` : ""}`}
      aria-labelledby="landing-app-preview-title"
    >
      <div className="landing-container">
        <div className="landing-section-head landing-app-preview-head">
          <span className="landing-kicker">Aperçu</span>
          <h2 id="landing-app-preview-title" className="landing-section-title">
            L&apos;espace que tu utilises au quotidien
          </h2>
          <p className="landing-section-lead">
            Une vidéo pour voir l&apos;espace en action, puis les écrans clés : offres ciblées,
            suivi de candidatures et progression.
          </p>
        </div>

        <LandingAppVideo />

        <div className="landing-app-preview-offers">
          <p className="landing-app-preview-label">Offres publiques sélectionnées</p>
          <LandingOfferCardsPreview />
        </div>

        <div className="landing-app-preview-stack">
          <div className="landing-app-preview-tracker">
            <p className="landing-app-preview-label">Suivi candidatures</p>
            <LandingApplicationTrackerDemo />
          </div>

          <div className="landing-app-preview-progress">
            <LandingApplicationChartDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
