"use client";

import { useEffect, useState } from "react";
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
import { normalizeOnboardingPayload, type OnboardingFormValues } from "@/lib/onboarding-validation";

export type ProfileEditorInitialValues = OnboardingFormValues;

type ProfileEditorProps = {
  initialValues: ProfileEditorInitialValues;
  /** Mode panneau : ouverture contrôlée par le parent (ex. bouton Modifier sur « Données »). */
  variant?: "default" | "panel";
  panelOpen?: boolean;
  onPanelOpenChange?: (open: boolean) => void;
};

export function ProfileEditor({
  initialValues,
  variant = "default",
  panelOpen = false,
  onPanelOpenChange,
}: ProfileEditorProps) {
  const router = useRouter();
  const isPanel = variant === "panel" && typeof onPanelOpenChange === "function";

  const [internalEditing, setInternalEditing] = useState(false);
  const isEditing = isPanel ? panelOpen : internalEditing;

  function setEditing(open: boolean) {
    if (isPanel) {
      onPanelOpenChange!(open);
    } else {
      setInternalEditing(open);
    }
  }

  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) {
      queueMicrotask(() => {
        setValues(initialValues);
        setError(null);
      });
    }
  }, [initialValues, isEditing]);

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

  async function saveProfile() {
    setError(null);
    setSuccess(null);

    const payload = normalizeOnboardingPayload(values);
    if (!payload) {
      setError("Formulaire invalide");
      return;
    }

    setLoading(true);
    try {
      const profileResponse = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!profileResponse.ok) {
        const body = await profileResponse.json().catch(() => ({}));
        throw new Error(body.error ?? "Erreur sauvegarde profil");
      }

      setSuccess("Profil mis à jour avec succès.");
      setEditing(false);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  if (isPanel && !panelOpen) {
    return null;
  }

  const formBody = (
    <>
      <div className="profile-form form">
        <div className="profile-form-section">
          <h3 className="profile-form-section-title">Identité & contact</h3>
          <div className="profile-form-grid">
            <div className="profile-field profile-field--full">
              <label htmlFor="fullName">Nom complet</label>
              <input
                id="fullName"
                value={values.fullName}
                onChange={(event) => update("fullName", event.target.value)}
              />
            </div>
            <div className="profile-field">
              <label htmlFor="phone">Téléphone</label>
              <input
                id="phone"
                value={values.phone}
                onChange={(event) => update("phone", event.target.value)}
              />
            </div>
            <div className="profile-field">
              <label htmlFor="schoolName">Établissement</label>
              <input
                id="schoolName"
                value={values.schoolName}
                onChange={(event) => update("schoolName", event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="profile-form-section">
          <h3 className="profile-form-section-title">Formation</h3>
          <div className="profile-form-grid">
            <div className="profile-field">
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
            </div>
            <div className="profile-field">
              <label htmlFor="studyDomain">Domaine</label>
              <select
                id="studyDomain"
                value={values.studyDomain}
                onChange={(event) => update("studyDomain", event.target.value as StudyDomain)}
              >
                {STUDY_DOMAINS.map((domain) => (
                  <option key={domain} value={domain}>
                    {STUDY_DOMAIN_LABEL[domain]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="profile-form-section">
          <h3 className="profile-form-section-title">Projet d&apos;alternance</h3>
          <div className="profile-form-grid">
            <div className="profile-field profile-field--full">
              <label htmlFor="targetJob">Poste recherché</label>
              <input
                id="targetJob"
                value={values.targetJob}
                onChange={(event) => update("targetJob", event.target.value)}
                placeholder="Ex. alternance marketing digital"
              />
            </div>
            <div className="profile-field">
              <label htmlFor="startDate">Début souhaité</label>
              <input
                id="startDate"
                type="date"
                value={values.startDate}
                onChange={(event) => update("startDate", event.target.value)}
              />
            </div>
            <div className="profile-field">
              <label htmlFor="contractType">Type de contrat</label>
              <select
                id="contractType"
                value={values.contractType}
                onChange={(event) => update("contractType", event.target.value as ContractType)}
              >
                {CONTRACT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {CONTRACT_TYPE_LABEL[type]}
                  </option>
                ))}
              </select>
            </div>
            <div className="profile-field">
              <label htmlFor="contractDuration">Durée</label>
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
            </div>
          </div>
        </div>

        <div className="profile-form-section">
          <h3 className="profile-form-section-title">Zones géographiques</h3>
          <fieldset className="regions-grid profile-regions">
            <legend className="profile-regions-legend">Régions ciblées</legend>
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
        </div>

      </div>

      {error ? <p className="error profile-form-alert">{error}</p> : null}
      {success ? <p className="success profile-form-alert">{success}</p> : null}

      <div className="form-actions profile-form-actions">
        <button
          type="button"
          className="secondary"
          onClick={() => {
            setValues(initialValues);
            setError(null);
            setSuccess(null);
            setEditing(false);
          }}
          disabled={loading}
        >
          Annuler
        </button>
        <button type="button" onClick={saveProfile} disabled={loading}>
          {loading ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </>
  );

  if (isPanel) {
    return (
      <section className="card profile-edit-card" aria-labelledby="profile-edit-heading">
        <div className="profile-panel-head profile-edit-head profile-edit-head--panel">
          <div>
            <h2 id="profile-edit-heading" className="profile-panel-title">
              Modifier le profil
            </h2>
            <p className="muted profile-panel-lead profile-panel-lead--short">
              Enregistre pour mettre à jour les données ci-dessus.
            </p>
          </div>
        </div>
        {formBody}
      </section>
    );
  }

  return (
    <section className="card profile-edit-card" aria-labelledby="profile-edit-heading">
      <div className="profile-panel-head profile-edit-head">
        <div>
          <h2 id="profile-edit-heading" className="profile-panel-title">
            Modifier
          </h2>
          <p className="muted profile-panel-lead">
            Mets à jour tes informations. Les changements sont enregistrés dans ton espace sécurisé.
          </p>
        </div>
      </div>

      {!isEditing ? (
        <button
          type="button"
          className="profile-edit-trigger"
          onClick={() => {
            setError(null);
            setSuccess(null);
            setEditing(true);
          }}
        >
          <span className="profile-edit-trigger-main">
            <span className="profile-edit-trigger-title">Éditer le profil</span>
            <span className="muted profile-edit-trigger-sub">
              Coordonnées, formation et critères d&apos;alternance
            </span>
          </span>
          <span className="profile-edit-trigger-chevron" aria-hidden="true">
            →
          </span>
        </button>
      ) : (
        formBody
      )}
    </section>
  );
}
