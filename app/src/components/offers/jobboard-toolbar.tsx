type JobboardToolbarProps = {
  q: string;
  resultCount: number;
  totalCount: number;
};

export function JobboardToolbar({ q, resultCount, totalCount }: JobboardToolbarProps) {
  const hasFilters = Boolean(q.trim());

  return (
    <div className="jobboard-toolbar">
      <form className="jobboard-toolbar-form" method="get" action="/dashboard/offres">
        <input type="hidden" name="view" value="jobboard" />
        <label className="jobboard-toolbar-field">
          <span className="jobboard-toolbar-label">Rechercher</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Titre, entreprise, ville…"
            className="jobboard-toolbar-input"
            autoComplete="off"
          />
        </label>
        <button type="submit" className="button-link secondary-link jobboard-toolbar-submit">
          Filtrer
        </button>
        {hasFilters ? (
          <a href="/dashboard/offres?view=jobboard" className="button-link secondary-link jobboard-toolbar-reset">
            Réinitialiser
          </a>
        ) : null}
      </form>
      <p className="muted jobboard-toolbar-meta">
        {hasFilters ? (
          <>
            <strong>{resultCount}</strong> résultat{resultCount > 1 ? "s" : ""} sur {totalCount} offres
            visibles
          </>
        ) : (
          <>
            <strong>{totalCount}</strong> offre{totalCount > 1 ? "s" : ""} visible
            {totalCount > 1 ? "s" : ""}
          </>
        )}
      </p>
    </div>
  );
}
