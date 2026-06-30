"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Celebration } from "@/components/ui/celebration";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { formatFrenchLongDate, getTodayYyyyMmDdParis } from "@/lib/dates-fr";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/validation";

export type ApplicationItem = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  url: string | null;
  status: ApplicationStatus;
  applied_at: string;
  notes: string | null;
};

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  sent: "Envoyée",
  interview: "Entretien",
  accepted: "Acceptée",
  rejected: "Refusée",
  archived: "Archivée",
};

type Filter = "all" | "active" | ApplicationStatus;

const FILTER_LABEL: Record<Filter, string> = {
  all: "Toutes",
  active: "Actives",
  sent: STATUS_LABEL.sent,
  interview: STATUS_LABEL.interview,
  accepted: STATUS_LABEL.accepted,
  rejected: STATUS_LABEL.rejected,
  archived: STATUS_LABEL.archived,
};

const FILTER_ORDER: Filter[] = [
  "active",
  "all",
  "sent",
  "interview",
  "accepted",
  "rejected",
  "archived",
];

type FormValues = {
  title: string;
  company: string;
  location: string;
  url: string;
  status: ApplicationStatus;
  appliedAt: string;
  notes: string;
};

function emptyForm(): FormValues {
  return {
    title: "",
    company: "",
    location: "",
    url: "",
    status: "sent",
    appliedAt: getTodayYyyyMmDdParis(),
    notes: "",
  };
}

function fromItem(item: ApplicationItem): FormValues {
  return {
    title: item.title,
    company: item.company ?? "",
    location: item.location ?? "",
    url: item.url ?? "",
    status: item.status,
    appliedAt: item.applied_at.slice(0, 10),
    notes: item.notes ?? "",
  };
}

type Props = {
  initialApplications: ApplicationItem[];
};

export function ApplicationsManager({ initialApplications }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<ApplicationItem[]>(initialApplications);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("active");
  const [drawerMode, setDrawerMode] = useState<"closed" | "create" | "edit">(
    "closed",
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormValues>(emptyForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const counts = useMemo(() => {
    const out = items.reduce(
      (acc, item) => {
        acc.total += 1;
        acc[item.status] = (acc[item.status] ?? 0) + 1;
        return acc;
      },
      { total: 0 } as Record<string, number>,
    );
    out.active = out.total - (out.archived ?? 0);
    return out;
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (filter === "all") {
        // ok
      } else if (filter === "active") {
        if (item.status === "archived") return false;
      } else if (item.status !== filter) {
        return false;
      }
      if (!q) return true;
      const haystack = `${item.title} ${item.company ?? ""} ${item.location ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, filter, search]);

  function openCreate() {
    setError(null);
    setEditingId(null);
    setForm(emptyForm());
    setDrawerMode("create");
  }

  function openEdit(item: ApplicationItem) {
    setError(null);
    setEditingId(item.id);
    setForm(fromItem(item));
    setDrawerMode("edit");
  }

  function closeDrawer() {
    setDrawerMode("closed");
    setEditingId(null);
    setError(null);
  }

  async function createApplication() {
    setError(null);
    if (!form.title.trim()) {
      setError("Donne un titre à ta candidature.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Erreur création candidature");
      }
      toast.push({
        title: "Candidature ajoutée",
        message: form.title,
        tone: "success",
      });
      closeDrawer();
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      toast.push({ title: "Erreur", message, tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: ApplicationStatus) {
    const previous = items.find((i) => i.id === id)?.status;
    if (previous === status) return;
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    try {
      const response = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) throw new Error("Erreur mise à jour statut");
      if (status === "accepted") {
        setCelebrate(true);
      }
      const message =
        status === "accepted"
          ? "Bravo, candidature marquée Acceptée"
          : `Statut → ${STATUS_LABEL[status]}`;
      toast.push({
        message,
        tone: status === "accepted" ? "success" : "default",
      });
      router.refresh();
    } catch (err) {
      setItems((current) =>
        current.map((item) =>
          item.id === id && previous ? { ...item, status: previous } : item,
        ),
      );
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      toast.push({ title: "Échec", message: msg, tone: "error" });
    }
  }

  async function deleteApplication(id: string) {
    const removed = items.find((i) => i.id === id);
    if (!removed) return;
    setItems((current) => current.filter((item) => item.id !== id));
    closeDrawer();

    let confirmed = true;
    toast.push({
      title: "Candidature supprimée",
      message: removed.title,
      tone: "default",
      durationMs: 6000,
      action: {
        label: "Annuler",
        onClick: () => {
          confirmed = false;
          setItems((current) => [...current, removed]);
        },
      },
    });

    setTimeout(async () => {
      if (!confirmed) return;
      try {
        const response = await fetch(`/api/applications?id=${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Erreur suppression candidature");
        router.refresh();
      } catch (err) {
        setItems((current) => [...current, removed]);
        const msg = err instanceof Error ? err.message : "Erreur inconnue";
        toast.push({ title: "Échec", message: msg, tone: "error" });
      }
    }, 6200);
  }

  const summaryFilters: { id: Filter; value: number }[] = [
    { id: "active", value: counts.active ?? 0 },
    { id: "all", value: counts.total ?? 0 },
    { id: "sent", value: counts.sent ?? 0 },
    { id: "interview", value: counts.interview ?? 0 },
    { id: "accepted", value: counts.accepted ?? 0 },
    { id: "rejected", value: counts.rejected ?? 0 },
    { id: "archived", value: counts.archived ?? 0 },
  ];

  return (
    <div className="applications-manager">
      {celebrate ? <Celebration onDone={() => setCelebrate(false)} /> : null}
      <div className="applications-summary">
        {summaryFilters
          .filter((f) => FILTER_ORDER.includes(f.id))
          .sort(
            (a, b) => FILTER_ORDER.indexOf(a.id) - FILTER_ORDER.indexOf(b.id),
          )
          .map((f) => (
            <button
              key={f.id}
              type="button"
              className={`summary-pill${
                f.id !== "all" && f.id !== "active" ? ` status-${f.id}` : ""
              }${filter === f.id ? " is-active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              <span className="summary-value">{f.value}</span>
              <span className="summary-label">{FILTER_LABEL[f.id]}</span>
            </button>
          ))}
      </div>

      <div className="applications-toolbar">
        <div className="applications-search">
          <input
            type="search"
            placeholder="Rechercher un poste, une entreprise..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Rechercher dans les candidatures"
          />
        </div>
        <button
          type="button"
          className="applications-add"
          onClick={openCreate}
        >
          + Nouvelle candidature
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={
            items.length === 0
              ? "Aucune candidature pour l'instant"
              : "Aucune candidature ne correspond"
          }
          message={
            items.length === 0
              ? "Ajoute ta première candidature pour suivre tes échanges et statuts."
              : "Modifie le filtre ou la recherche pour retrouver ta candidature."
          }
          action={
            items.length === 0 ? (
              <button type="button" onClick={openCreate}>
                Ajouter ma 1ère candidature
              </button>
            ) : null
          }
        />
      ) : (
        <ul className="applications-list">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="application-row"
              role="button"
              tabIndex={0}
              onClick={() => openEdit(item)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openEdit(item);
                }
              }}
            >
              <div className="application-main">
                <div className="application-title">
                  {item.title}
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      style={{
                        marginLeft: "0.45rem",
                        fontSize: "0.78rem",
                        color: "var(--muted)",
                      }}
                    >
                      ↗
                    </a>
                  ) : null}
                </div>
                <div className="application-meta">
                  {item.company ?? "Entreprise non renseignée"}
                  {item.location ? ` · ${item.location}` : ""}
                  {` · ${formatFrenchLongDate(item.applied_at)}`}
                </div>
              </div>

              <div
                className="application-actions"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="application-chips-desktop status-chips">
                  {APPLICATION_STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`status-chip status-${status}${
                        item.status === status ? " is-active" : ""
                      }`}
                      onClick={() => updateStatus(item.id, status)}
                    >
                      {STATUS_LABEL[status]}
                    </button>
                  ))}
                </div>
                <span
                  className={`application-status-mobile status-pill status-${item.status}`}
                >
                  {STATUS_LABEL[item.status]}
                </span>
                <span className="application-chevron" aria-hidden>
                  ›
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Drawer
        open={drawerMode !== "closed"}
        onClose={closeDrawer}
        title={drawerMode === "edit" ? "Détail candidature" : "Nouvelle candidature"}
        footer={
          drawerMode === "edit" && editingId ? (
            <>
              <button
                type="button"
                className="secondary"
                onClick={() => deleteApplication(editingId)}
                style={{ color: "var(--danger)" }}
              >
                Supprimer
              </button>
              <button type="button" onClick={closeDrawer}>
                Fermer
              </button>
            </>
          ) : (
            <>
              <button type="button" className="secondary" onClick={closeDrawer}>
                Annuler
              </button>
              <button type="button" onClick={createApplication} disabled={loading}>
                {loading ? "Ajout..." : "Ajouter"}
              </button>
            </>
          )
        }
      >
        <div className="drawer-section">
          <span className="drawer-section-title">Statut</span>
          <div className="status-chips">
            {APPLICATION_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                className={`status-chip status-${status}${
                  form.status === status ? " is-active" : ""
                }`}
                onClick={() => {
                  setForm((current) => ({ ...current, status }));
                  if (drawerMode === "edit" && editingId) {
                    void updateStatus(editingId, status);
                  }
                }}
              >
                {STATUS_LABEL[status]}
              </button>
            ))}
          </div>
        </div>

        <div className="drawer-section">
          <label htmlFor="appTitle">Intitulé du poste</label>
          <input
            id="appTitle"
            value={form.title}
            placeholder="Ex. Alternance Data Analyst"
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
          />
        </div>

        <div className="drawer-section">
          <label htmlFor="appCompany">Entreprise</label>
          <input
            id="appCompany"
            value={form.company}
            placeholder="Ex. TechCorp"
            onChange={(event) =>
              setForm((current) => ({ ...current, company: event.target.value }))
            }
          />
        </div>

        <div className="drawer-section">
          <label htmlFor="appLocation">Lieu</label>
          <input
            id="appLocation"
            value={form.location}
            placeholder="Ville, région ou télétravail"
            onChange={(event) =>
              setForm((current) => ({ ...current, location: event.target.value }))
            }
          />
        </div>

        <div className="drawer-section">
          <label htmlFor="appUrl">Lien vers l&apos;offre</label>
          <input
            id="appUrl"
            type="url"
            value={form.url}
            placeholder="https://..."
            onChange={(event) =>
              setForm((current) => ({ ...current, url: event.target.value }))
            }
          />
        </div>

        <div className="drawer-section">
          <label htmlFor="appDate">Date de candidature</label>
          <input
            id="appDate"
            type="date"
            value={form.appliedAt}
            onChange={(event) =>
              setForm((current) => ({ ...current, appliedAt: event.target.value }))
            }
          />
        </div>

        <div className="drawer-section">
          <label htmlFor="appNotes">Notes</label>
          <input
            id="appNotes"
            value={form.notes}
            placeholder="Contact, prochaine étape, salaire..."
            onChange={(event) =>
              setForm((current) => ({ ...current, notes: event.target.value }))
            }
          />
        </div>

        {error ? <p className="error">{error}</p> : null}
      </Drawer>
    </div>
  );
}
