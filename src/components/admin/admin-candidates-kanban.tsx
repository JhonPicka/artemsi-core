"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { AdminCandidateCard, CandidateKanbanStage } from "@/lib/admin-candidates";

type StageDef = { id: CandidateKanbanStage; title: string; hint: string };

type Props = {
  candidates: AdminCandidateCard[];
  stages: StageDef[];
};

function initials(name: string | null, email: string) {
  const n = (name ?? "").trim();
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

function subscriptionLabel(status: string) {
  const map: Record<string, string> = {
    active: "Pro",
    inactive: "Gratuit",
    past_due: "Impayé",
    canceled: "Résilié",
  };
  return map[status] ?? status;
}

function formatRelative(iso: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function AdminCandidatesKanban({ candidates, stages }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter((c) => {
      const haystack = [
        c.fullName,
        c.email,
        c.targetJob,
        c.schoolName,
        c.studyDomain,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [candidates, query]);

  const byStage = useMemo(() => {
    const map = new Map<CandidateKanbanStage, AdminCandidateCard[]>();
    for (const stage of stages) map.set(stage.id, []);
    for (const card of filtered) {
      map.get(card.stage)?.push(card);
    }
    return map;
  }, [filtered, stages]);

  return (
    <div className="admin-candidates-page">
      <div className="admin-candidates-toolbar">
        <label className="admin-candidates-search">
          <span className="sr-only">Rechercher un candidat</span>
          <input
            type="search"
            placeholder="Nom, école, métier recherché…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <p className="muted admin-candidates-count">
          {filtered.length} candidat{filtered.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="admin-candidates-kanban">
        {stages.map((stage) => {
          const cards = byStage.get(stage.id) ?? [];
          return (
            <section
              key={stage.id}
              className={`admin-candidates-column admin-candidates-column--${stage.id}`}
              aria-label={stage.title}
            >
              <header className="admin-candidates-column-head">
                <h2>{stage.title}</h2>
                <span className="admin-candidates-column-count">{cards.length}</span>
                <p className="muted">{stage.hint}</p>
              </header>
              <div className="admin-candidates-column-body">
                {cards.length === 0 ? (
                  <p className="muted admin-candidates-empty">Aucun candidat</p>
                ) : (
                  cards.map((card) => (
                    <Link
                      key={card.id}
                      href={`/admin/candidats/${card.id}`}
                      className="admin-candidate-card"
                    >
                      <div className="admin-candidate-card-top">
                        <span className="admin-candidate-avatar" aria-hidden="true">
                          {initials(card.fullName, card.email)}
                        </span>
                        <div>
                          <p className="admin-candidate-name">{card.fullName ?? card.email}</p>
                          <p className="admin-candidate-school">
                            {card.schoolName ?? "École non renseignée"}
                          </p>
                        </div>
                      </div>
                      <p className="admin-candidate-target">
                        {card.targetJob ?? "Métier non renseigné"}
                      </p>
                      <div className="admin-candidate-stats">
                        <span>{card.applicationsCount} candidature(s)</span>
                        <span>{card.interestsCount} intérêt(s)</span>
                        <span>{card.offerClicksCount} clic(s)</span>
                      </div>
                      <div className="admin-candidate-card-foot">
                        <span
                          className={
                            card.subscriptionStatus === "active"
                              ? "admin-pill admin-pill--ok"
                              : "admin-pill"
                          }
                        >
                          {subscriptionLabel(card.subscriptionStatus)}
                        </span>
                        <span className="muted">{formatRelative(card.lastActivityAt)}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
