"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  CONTRACT_DURATION_LABEL,
  CONTRACT_DURATIONS,
  CONTRACT_TYPE_LABEL,
  CONTRACT_TYPES,
  REGIONS,
  STUDY_DOMAIN_LABEL,
  STUDY_DOMAINS,
  STUDY_LEVEL_LABEL,
  STUDY_LEVEL_OPTIONS,
  type ContractDuration,
  type ContractType,
  type StudyDomain,
  type StudyLevel,
} from "@/lib/constants";
import { onboardingSchema } from "@/lib/validation";

type OnboardingFormProps = {
  initialValues: {
    fullName: string;
    phone: string;
    schoolName: string;
    studyLevel: StudyLevel;
    studyDomain: StudyDomain;
    targetJob: string;
    regions: string[];
    startDate: string;
    contractType: ContractType;
    contractDuration: ContractDuration;
  };
};

const totalSteps = 3;

export function OnboardingForm({ initialValues }: OnboardingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [values, setValues] = useState(initialValues);

  const progress = useMemo(() => Math.round((step / totalSteps) * 100), [step]);

  const canGoPrevious = step > 1;
  const canGoNext = step < totalSteps;

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

  async function uploadDocument(documentType: "cv" | "cover_letter", file: File) {
    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("file", file);

    const response = await fetch("/api/documents", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error ?? "Echec upload document");
    }
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

      if (cvFile) {
        await uploadDocument("cv", cvFile);
      }
      if (coverLetterFile) {
        await uploadDocument("cover_letter", coverLetterFile);
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
      <h1>Finalise ton profil candidat</h1>
      <p className="muted">
        Étape {step} / {totalSteps} — progression {progress}%
      </p>

      {step === 1 ? (
        <>
          <label htmlFor="fullName">Nom complet</label>
          <input
            id="fullName"
            value={values.fullName}
            onChange={(event) => update("fullName", event.target.value)}
          />

          <label htmlFor="phone">Téléphone</label>
          <input
            id="phone"
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
          />

          <label htmlFor="schoolName">Nom de l&apos;école</label>
          <input
            id="schoolName"
            value={values.schoolName}
            onChange={(event) => update("schoolName", event.target.value)}
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
          <label htmlFor="targetJob">Poste recherché</label>
          <input
            id="targetJob"
            value={values.targetJob}
            onChange={(event) => update("targetJob", event.target.value)}
          />

          <label htmlFor="startDate">Date de début souhaitée</label>
          <input
            id="startDate"
            type="date"
            value={values.startDate}
            onChange={(event) => update("startDate", event.target.value)}
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

          <label htmlFor="contractDuration">Durée du contrat</label>
          <select
            id="contractDuration"
            value={values.contractDuration}
            onChange={(event) =>
              update("contractDuration", event.target.value as ContractDuration)
            }
          >
            {CONTRACT_DURATIONS.map((duration) => (
              <option key={duration} value={duration}>
                {CONTRACT_DURATION_LABEL[duration]}
              </option>
            ))}
          </select>

          <fieldset className="regions-grid">
            <legend>Régions ciblées</legend>
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
        </>
      ) : null}

      {step === 3 ? (
        <>
          <label htmlFor="cvUpload">CV (optionnel, PDF ou DOC/DOCX)</label>
          <input
            id="cvUpload"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(event) => setCvFile(event.target.files?.[0] ?? null)}
          />

          <label htmlFor="coverLetterUpload">
            Lettre de motivation (optionnel, PDF ou DOC/DOCX)
          </label>
          <input
            id="coverLetterUpload"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(event) => setCoverLetterFile(event.target.files?.[0] ?? null)}
          />

          <p className="muted">
            Tu peux aussi ajouter ou remplacer ces documents plus tard dans ton espace.
          </p>
        </>
      ) : null}

      {error ? <p className="error">{error}</p> : null}

      <div className="form-actions">
        {canGoPrevious ? (
          <button type="button" className="secondary" onClick={() => setStep(step - 1)}>
            Retour
          </button>
        ) : (
          <span />
        )}

        {canGoNext ? (
          <button type="button" onClick={() => setStep(step + 1)}>
            Continuer
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={loading}>
            {loading ? "Enregistrement..." : "Terminer mon inscription"}
          </button>
        )}
      </div>
    </div>
  );
}
