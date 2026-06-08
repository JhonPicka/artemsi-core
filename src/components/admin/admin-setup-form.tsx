"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminSetupForm({ initialName, email }: { initialName: string; email: string }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Enregistrement impossible");
      }

      router.push("/admin");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <span className="brand-chip">ADMIN</span>
      <h1>Ton nom</h1>
      <p className="muted">
        Compte administrateur pour <strong>{email}</strong>. Indique simplement ton nom pour accéder
        au tableau de bord — pas d&apos;onboarding candidat ni d&apos;abonnement.
      </p>

      <label htmlFor="fullName">Nom complet</label>
      <input
        id="fullName"
        name="fullName"
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        required
        autoComplete="name"
      />

      {error ? <p className="error">{error}</p> : null}

      <button type="submit" disabled={loading}>
        {loading ? "Enregistrement..." : "Accéder à l'admin"}
      </button>
    </form>
  );
}
