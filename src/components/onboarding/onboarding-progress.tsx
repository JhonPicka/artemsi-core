import { ONBOARDING_STEP_LABELS } from "@/lib/constants";

type Props = {
  step: number;
  totalSteps: number;
};

export function OnboardingProgress({ step, totalSteps }: Props) {
  const progress = Math.round((step / totalSteps) * 100);

  return (
    <div className="onboarding-progress" aria-live="polite">
      <div className="onboarding-progress-head">
        <span className="onboarding-progress-label">
          Étape {step} / {totalSteps} — {ONBOARDING_STEP_LABELS[step - 1]}
        </span>
        <span className="onboarding-progress-value">{progress}%</span>
      </div>
      <div
        className="onboarding-progress-track"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progression onboarding : ${progress}%`}
      >
        <div className="onboarding-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <ol className="onboarding-progress-steps">
        {ONBOARDING_STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const state =
            stepNumber < step ? "done" : stepNumber === step ? "current" : "upcoming";
          return (
            <li key={label} className={`onboarding-progress-step onboarding-progress-step--${state}`}>
              <span className="onboarding-progress-step-dot" aria-hidden="true" />
              <span className="onboarding-progress-step-label">{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
