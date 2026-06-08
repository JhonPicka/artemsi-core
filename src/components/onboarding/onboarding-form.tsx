"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import {
  ACQUISITION_SOURCE_LABEL,
  ACQUISITION_SOURCES,
  ALTERNANCE_RHYTHM_LABEL,
  ALTERNANCE_RHYTHM_OPTIONS,
  APPLICATIONS_SENT_RANGE_LABEL,
  APPLICATIONS_SENT_RANGES,
  CONTRACT_DURATION_LABEL,
  CONTRACT_DURATIONS,
  CONTRACT_TYPE_LABEL,
  CONTRACT_TYPES,
  PREFERRED_SECTOR_LABEL,
  PREFERRED_SECTORS,
  REGIONS,
  SEARCH_LEVEL_LABEL,
  SEARCH_LEVELS,
  STUDY_DOMAIN_LABEL,
  STUDY_DOMAINS,
  STUDY_LEVEL_LABEL,
  STUDY_LEVEL_OPTIONS,
  type AcquisitionSource,
  type AlternanceRhythm,
  type ApplicationsSentRange,
  type ContractDuration,
  type ContractType,
  type PreferredSector,
  type SearchLevel,
  type StudyDomain,
  type StudyLevel,
} from "@/lib/constants";
import {
  normalizeOnboardingPayload,
  validateOnboardingStep,
  type OnboardingFormValues,
} from "@/lib/onboarding-validation";

type OnboardingFormProps = {
  initialValues: OnboardingFormValues;
};

const totalSteps = 5;

function requiresAlternanceRhythm(contractType: ContractType) {
  return contractType === "ALTERNANCE" || contractType === "APPRENTISSAGE";
}

export function OnboardingForm({ initialValues }: OnboardingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [values, setValues] = useState(initialValues);

  const canGoPrevious = step > 1;
  const canGoNext = step < totalSteps;
  const showAlternanceRhythm = requiresAlternanceRhythm(values.contractType);

  function update<K extends keyof OnboardingFormValues>(key: K, value: OnboardingFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function toggleRegion(region: string) {
    setValues((current) => ({
      ...current,
      regions: current.regions.includes(region)
        ? current.regions.filter((item) => item !== region)
        : [...current.regions, region],
    }));
    setError(null);
  }

  function toggleSector(sector: PreferredSector) {
    setValues((current) => ({
      ...current,
      preferredSectors: current.preferredSectors.includes(sector)
        ? current.preferredSectors.filter((item) => item !== sector)
        : [...current.preferredSectors, sector],
    }));
    setError(null);
  }

  function goNext() {
    const stepError = validateOnboardingStep(step, values);
    if (stepError) {
      setError(stepError);
      return;
    }
    setError(null);
    setStep((current) => Math.min(current + 1, totalSteps));
  }

  function goPrevious() {
    setError(null);
    setStep((current) => Math.max(current - 1, 1));
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

    for (let checkpoint = 1; checkpoint <= 4; checkpoint += 1) {
      const stepError = validateOnboardingStep(checkpoint, values);
      if (stepError) {
        setStep(checkpoint);
        setError(stepError);
        return;
      }
    }

    const payload = normalizeOnboardingPayload(values);
    if (!payload) {
      setError("Formulaire invalide");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <div className="card form onboarding-form">
      <span className="brand-chip">ONBOARDING</span>
      <h1>Finalise ton profil candidat</h1>
      <p className="muted">
        Complète chaque étape pour débloquer les offres adaptées à ton profil.
      </p>

      <OnboardingProgress step={step} totalSteps={totalSteps} />

      {step === 1 ? (
        <section className="onboarding-step" aria-labelledby="onboarding-step-1">
          <h2 id="onboarding-step-1" className="onboarding-step-title">
            Identité & formation
          </h2>
          <label htmlFor="fullName">Nom complet</label>
          <input
            id="fullName"
            value={values.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            required
          />

          <label htmlFor="phone">Téléphone</label>
          <input
            id="phone"
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
            required
          />

          <label htmlFor="schoolName">Nom de l&apos;école</label>
          <input
            id="schoolName"
            value={values.schoolName}
            onChange={(event) => update("schoolName", event.target.value)}
            required
          />

          <label htmlFor="studyLevel">Niveau d&apos;étude</label>
          <select
            id="studyLevel"
            value={values.studyLevel}
            onChange={(event) => update("studyLevel", event.target.value as StudyLevel)}
            required
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
            onChange={(event) => update("studyDomain", event.target.value as StudyDomain)}
            required
          >
            {STUDY_DOMAINS.map((domain) => (
              <option key={domain} value={domain}>
                {STUDY_DOMAIN_LABEL[domain]}
              </option>
            ))}
          </select>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="onboarding-step" aria-labelledby="onboarding-step-2">
          <h2 id="onboarding-step-2" className="onboarding-step-title">
            Critères de recherche
          </h2>
          <label htmlFor="targetJob">Poste recherché</label>
          <input
            id="targetJob"
            value={values.targetJob}
            onChange={(event) => update("targetJob", event.target.value)}
            required
          />

          <label htmlFor="startDate">Date de début souhaitée</label>
          <input
            id="startDate"
            type="date"
            value={values.startDate}
            onChange={(event) => update("startDate", event.target.value)}
            required
          />

          <label htmlFor="contractType">Type de contrat</label>
          <select
            id="contractType"
            value={values.contractType}
            onChange={(event) => {
              const contractType = event.target.value as ContractType;
              setValues((current) => ({
                ...current,
                contractType,
                alternanceRhythm: requiresAlternanceRhythm(contractType)
                  ? current.alternanceRhythm
                  : "NOT_APPLICABLE",
                alternanceRhythmOther: requiresAlternanceRhythm(contractType)
                  ? current.alternanceRhythmOther
                  : "",
              }));
              setError(null);
            }}
            required
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
            required
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
        </section>
      ) : null}

      {step === 3 ? (
        <section className="onboarding-step" aria-labelledby="onboarding-step-3">
          <h2 id="onboarding-step-3" className="onboarding-step-title">
            Alternance & secteurs
          </h2>

          {showAlternanceRhythm ? (
            <>
              <p className="onboarding-callout">
                <strong>Rythme alternance</strong> — très important pour les profils ingénieurs.
              </p>
              <label htmlFor="alternanceRhythm">Rythme souhaité</label>
              <select
                id="alternanceRhythm"
                value={values.alternanceRhythm || ""}
                onChange={(event) =>
                  update("alternanceRhythm", event.target.value as AlternanceRhythm)
                }
                required
              >
                <option value="" disabled>
                  Sélectionne un rythme
                </option>
                {ALTERNANCE_RHYTHM_OPTIONS.map((rhythm) => (
                  <option key={rhythm} value={rhythm}>
                    {ALTERNANCE_RHYTHM_LABEL[rhythm]}
                  </option>
                ))}
              </select>

              {values.alternanceRhythm === "AUTRE" ? (
                <>
                  <label htmlFor="alternanceRhythmOther">Précise ton rythme</label>
                  <input
                    id="alternanceRhythmOther"
                    value={values.alternanceRhythmOther}
                    onChange={(event) => update("alternanceRhythmOther", event.target.value)}
                    placeholder="Ex. 1 semaine école / 3 semaines entreprise"
                    required
                  />
                </>
              ) : null}
            </>
          ) : (
            <p className="muted">
              Le rythme alternance s&apos;applique aux contrats alternance et apprentissage. Tu
              pourras le renseigner si tu changes de type de contrat.
            </p>
          )}

          <fieldset className="regions-grid onboarding-sectors">
            <legend>Secteurs préférés</legend>
            {PREFERRED_SECTORS.map((sector) => (
              <label key={sector} className="checkbox-line">
                <input
                  type="checkbox"
                  checked={values.preferredSectors.includes(sector)}
                  onChange={() => toggleSector(sector)}
                />
                <span>{PREFERRED_SECTOR_LABEL[sector]}</span>
              </label>
            ))}
          </fieldset>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="onboarding-step" aria-labelledby="onboarding-step-4">
          <h2 id="onboarding-step-4" className="onboarding-step-title">
            Ton parcours de recherche
          </h2>
          <p className="muted">
            Ces informations nous aident à mieux t&apos;accompagner et à comprendre ce qui fonctionne
            pour ARTEMSI.
          </p>

          <label htmlFor="acquisitionSource">Comment as-tu connu ARTEMSI ?</label>
          <select
            id="acquisitionSource"
            value={values.acquisitionSource}
            onChange={(event) =>
              update("acquisitionSource", event.target.value as AcquisitionSource)
            }
            required
          >
            <option value="" disabled>
              Sélectionne une source
            </option>
            {ACQUISITION_SOURCES.map((source) => (
              <option key={source} value={source}>
                {ACQUISITION_SOURCE_LABEL[source]}
              </option>
            ))}
          </select>

          {values.acquisitionSource === "AUTRE" ? (
            <>
              <label htmlFor="acquisitionSourceOther">Précise la source</label>
              <input
                id="acquisitionSourceOther"
                value={values.acquisitionSourceOther}
                onChange={(event) => update("acquisitionSourceOther", event.target.value)}
                required
              />
            </>
          ) : null}

          <label htmlFor="applicationsSentRange">
            Nombre de candidatures déjà envoyées
          </label>
          <select
            id="applicationsSentRange"
            value={values.applicationsSentRange}
            onChange={(event) =>
              update("applicationsSentRange", event.target.value as ApplicationsSentRange)
            }
            required
          >
            <option value="" disabled>
              Sélectionne une fourchette
            </option>
            {APPLICATIONS_SENT_RANGES.map((range) => (
              <option key={range} value={range}>
                {APPLICATIONS_SENT_RANGE_LABEL[range]}
              </option>
            ))}
          </select>

          <label htmlFor="searchLevel">Niveau de recherche</label>
          <select
            id="searchLevel"
            value={values.searchLevel}
            onChange={(event) => update("searchLevel", event.target.value as SearchLevel)}
            required
          >
            <option value="" disabled>
              Sélectionne ton niveau
            </option>
            {SEARCH_LEVELS.map((level) => (
              <option key={level} value={level}>
                {SEARCH_LEVEL_LABEL[level]}
              </option>
            ))}
          </select>
        </section>
      ) : null}

      {step === 5 ? (
        <section className="onboarding-step" aria-labelledby="onboarding-step-5">
          <h2 id="onboarding-step-5" className="onboarding-step-title">
            Documents (optionnel)
          </h2>
          <label htmlFor="cvUpload">CV (PDF ou DOC/DOCX)</label>
          <input
            id="cvUpload"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(event) => setCvFile(event.target.files?.[0] ?? null)}
          />

          <label htmlFor="coverLetterUpload">Lettre de motivation (PDF ou DOC/DOCX)</label>
          <input
            id="coverLetterUpload"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(event) => setCoverLetterFile(event.target.files?.[0] ?? null)}
          />

          <p className="muted">
            Tu peux aussi ajouter ou remplacer ces documents plus tard dans ton espace.
          </p>
        </section>
      ) : null}

      {error ? <p className="error onboarding-step-error">{error}</p> : null}

      <div className="form-actions">
        {canGoPrevious ? (
          <button type="button" className="secondary" onClick={goPrevious}>
            Retour
          </button>
        ) : (
          <span />
        )}

        {canGoNext ? (
          <button type="button" onClick={goNext}>
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
