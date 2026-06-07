"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  CONTRACT_TYPE_LABEL,
  CONTRACT_TYPES,
  REGIONS,
  STUDY_DOMAIN_LABEL,
  STUDY_DOMAINS,
  STUDY_LEVEL_LABEL,
  STUDY_LEVEL_OPTIONS,
  type ContractType,
  type StudyDomain,
  type StudyLevel,
} from "@/lib/constants";
import { onboardingSchema } from "@/lib/validation";

type OnboardingFormProps = {
  initialValues: {
    fullName: string;
    schoolName: string;
    studyLevel: StudyLevel;
    studyDomain: StudyDomain;
    targetJob: string;
    regions: string[];
    startDate: string;
    contractType: ContractType;
  };
};

const totalSteps = 2;

export function OnboardingForm({ initialValues }: OnboardingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState(initialValues);

  const progress = useMemo(() => Math.round((step / totalSteps) * 100), [step]);

  function update<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function toggleRegion(region: string) {
    setValues((current) => ({
      ...current,
      regions: current.regions.includes(region)
        ? current.regions.filter((item) => item !== region)
        : [...current.regions, region],
    }));
  }

  async function submit() {
    setError(null);
    const parsed = onboardingSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Echec sauvegarde du profil");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Une erreur est survenue",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card form">
      <span className="brand-chip">ONBOARDING</span>
      <h1>Finalise ton profil</h1>
      <p className="muted">
        Étape {step} sur {totalSteps} — {progress}% complété
      </p>

      {step === 1 ? (
        <>
          <p className="muted" style={{ marginBottom: "0.5rem" }}>
            Quelques infos sur toi pour personnaliser tes offres.
          </p>

          <label htmlFor="fullName">Nom complet</label>
          <input
            id="fullName"
            value={values.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            placeholder="Prénom Nom"
            autoComplete="name"
          />

          <label htmlFor="schoolName">École / Établissement</label>
          <input
            id="schoolName"
            value={values.schoolName}
            onChange={(event) => update("schoolName", event.target.value)}
            placeholder="ex. ESGI, Université Paris-Saclay…"
          />

          <label htmlFor="studyLevel">Niveau d&apos;étude</label>
          <select
            id="studyLevel"
            value={values.studyLevel}
            onChange={(event) => update("studyLevel", event.target.value as StudyLevel)}
          >
            {STUDY_LEVEL_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {STUDY_LEVEL_LABEL[level]}
              </option>
            ))}
          </select>

          <label htmlFor="studyDomain">Domaine d&apos;étude</label>
          <select
            id="studyDomain"
            value={values.studyDomain}
            onChange={(event) =>
              update("studyDomain", event.target.value as StudyDomain)
            }
          >
            {STUDY_DOMAINS.map((domain) => (
              <option key={domain} value={domain}>
                {STUDY_DOMAIN_LABEL[domain]}
              </option>
            ))}
          </select>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <p className="muted" style={{ marginBottom: "0.5rem" }}>
            Ce que tu recherches — on s&apos;en sert pour cibler tes offres.
          </p>

          <label htmlFor="targetJob">Poste visé</label>
          <input
            id="targetJob"
            value={values.targetJob}
            onChange={(event) => update("targetJob", event.target.value)}
            placeholder="ex. Développeur web, Chargé de marketing…"
          />

          <label htmlFor="contractType">Type de contrat</label>
          <select
            id="contractType"
            value={values.contractType}
            onChange={(event) =>
              update("contractType", event.target.value as ContractType)
            }
          >
            {CONTRACT_TYPES.map((type) => (
              <option key={type} value={type}>
                {CONTRACT_TYPE_LABEL[type]}
              </option>
            ))}
          </select>

          <label htmlFor="startDate">Date de début souhaitée</label>
          <input
            id="startDate"
            type="date"
            value={values.startDate}
            onChange={(event) => update("startDate", event.target.value)}
          />

          <fieldset className="regions-grid">
            <legend>Régions ciblées <span className="muted">(une ou plusieurs)</span></legend>
            {REGIONS.map((region) => (
              <label key={region} className="checkbox-line">
                <input
                  type="checkbox"
                  checked={values.regions.includes(region)}
                  onChange={() => toggleRegion(region)}
                />
                <span>{region}</span>
              </label>
            ))}
          </fieldset>

          <p className="muted" style={{ fontSize: "0.85rem" }}>
            Tu pourras ajouter ton CV et ta lettre depuis ton espace, à tout moment.
          </p>
        </>
      ) : null}

      {error ? <p className="error">{error}</p> : null}

      <div className="form-actions">
        {step > 1 ? (
          <button type="button" className="secondary" onClick={() => setStep(step - 1)}>
            Retour
          </button>
        ) : (
          <span />
        )}

        {step < totalSteps ? (
          <button type="button" onClick={() => setStep(step + 1)}>
            Continuer
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={loading}>
            {loading ? "Enregistrement..." : "Accéder à mon espace"}
          </button>
        )}
      </div>
    </div>
  );
}
