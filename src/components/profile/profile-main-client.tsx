"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import { ManageAccountPanel } from "@/components/profile/manage-account-panel";
import { ProfileEditor, type ProfileEditorInitialValues } from "@/components/profile/profile-editor";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export type ProfileDocSlot = {
  file_name: string;
  signedUrl: string | null;
} | null;

const DOC_ACCEPT = ".pdf,.doc,.docx";

async function postDocument(documentType: "cv" | "cover_letter", file: File) {
  const formData = new FormData();
  formData.append("documentType", documentType);
  formData.append("file", file);

  const response = await fetch("/api/documents", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Erreur lors de l'import");
  }
}

function ProfileDocCard({
  title,
  documentType,
  doc,
  emptyMeta,
  iconModifier,
}: {
  title: string;
  documentType: "cv" | "cover_letter";
  doc: ProfileDocSlot;
  emptyMeta: string;
  iconModifier?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    setImporting(true);
    try {
      await postDocument(documentType, file);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setImporting(false);
    }
  }

  const importLabel =
    documentType === "cv" ? "Importer un CV" : "Importer une lettre de motivation";

  return (
    <article
      className={`profile-doc-card ${doc ? "profile-doc-card--ok" : "profile-doc-card--empty"}`}
    >
      <div
        className={["profile-doc-icon", iconModifier].filter(Boolean).join(" ")}
        aria-hidden="true"
      >
        {documentType === "cv" ? "CV" : "LM"}
      </div>
      <div className="profile-doc-body">
        <h3 className="profile-doc-title">{title}</h3>
        {doc ? (
          <>
            <p className="profile-doc-meta">{doc.file_name}</p>
            {!doc.signedUrl ? (
              <p className="muted profile-doc-meta">Lien indisponible</p>
            ) : null}
          </>
        ) : (
          <p className="muted profile-doc-meta">{emptyMeta}</p>
        )}
      </div>
      <div className="profile-doc-actions">
        <input
          ref={inputRef}
          type="file"
          accept={DOC_ACCEPT}
          className="profile-doc-file-input"
          onChange={onFileChange}
          aria-label={importLabel}
          tabIndex={-1}
        />
        {doc?.signedUrl ? (
          <a
            className="button-link"
            href={doc.signedUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ouvrir
          </a>
        ) : null}
        <button
          type="button"
          className="button-link secondary-link"
          onClick={() => inputRef.current?.click()}
          disabled={importing}
        >
          {importing ? "Import…" : "Importer"}
        </button>
      </div>
      {error ? <p className="error profile-doc-import-error">{error}</p> : null}
    </article>
  );
}

type ProfileMainClientProps = {
  isPro: boolean;
  summaryRows: { label: string; value: string }[];
  cvDoc: ProfileDocSlot;
  letterDoc: ProfileDocSlot;
  editorInitialValues: ProfileEditorInitialValues;
};

export function ProfileMainClient({
  isPro,
  summaryRows,
  cvDoc,
  letterDoc,
  editorInitialValues,
}: ProfileMainClientProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className="profile-layout">
        <section
          className="card profile-panel profile-panel--data"
          aria-labelledby="profile-data-heading"
        >
          <div className="profile-panel-head profile-panel-head--toolbar">
            <div className="profile-panel-head-text">
              <h2 id="profile-data-heading" className="profile-panel-title">
                Données enregistrées
              </h2>
              <p className="muted profile-panel-lead profile-panel-lead--short">
                Utilisé pour le matching des offres.
              </p>
            </div>
            {!editOpen ? (
              <button
                type="button"
                className="secondary profile-data-edit-btn"
                onClick={() => setEditOpen(true)}
              >
                Modifier
              </button>
            ) : null}
          </div>
          {!editOpen ? (
            <dl className="profile-dl">
              {summaryRows.map((row) => (
                <div key={row.label} className="profile-dl-row">
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="muted profile-editing-placeholder">
              Formulaire ci-dessous — enregistre ou annule depuis ce bloc.
            </p>
          )}
        </section>

        <section
          className="card profile-panel profile-panel--docs"
          aria-labelledby="profile-docs-heading"
        >
          <div className="profile-panel-head">
            <div>
              <h2 id="profile-docs-heading" className="profile-panel-title">
                Documents
              </h2>
              <p className="muted profile-panel-lead profile-panel-lead--short">
                PDF ou Word recommandé.
              </p>
            </div>
          </div>
          <div className="profile-docs-grid">
            <ProfileDocCard
              title="Curriculum vitae"
              documentType="cv"
              doc={cvDoc}
              emptyMeta="Aucun CV actif."
            />
            <ProfileDocCard
              title="Lettre de motivation"
              documentType="cover_letter"
              doc={letterDoc}
              emptyMeta="Optionnelle."
              iconModifier="profile-doc-icon--lm"
            />
          </div>
        </section>

        <section
          className="card profile-panel profile-panel--settings"
          aria-labelledby="profile-settings-heading"
        >
          <div className="profile-panel-head">
            <div>
              <h2 id="profile-settings-heading" className="profile-panel-title">
                Réglages
              </h2>
              <p className="muted profile-panel-lead profile-panel-lead--short">
                Apparence et abonnement.
              </p>
            </div>
          </div>
          <ThemeToggle variant="card" />
          <ManageAccountPanel isPro={isPro} />
        </section>
      </div>

      <ProfileEditor
        variant="panel"
        panelOpen={editOpen}
        onPanelOpenChange={setEditOpen}
        initialValues={editorInitialValues}
      />
    </>
  );
}
