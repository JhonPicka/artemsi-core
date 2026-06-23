const STATS = [
  {
    value: "~10",
    label: "candidatures ciblées pour 1 entretien",
    compare: "contre ~35 seul",
  },
  {
    value: "5–8 sem.",
    label: "pour signer ton alternance",
    compare: "contre 4–6 mois seul",
  },
  {
    value: "2–3",
    label: "versions de CV pour une base solide",
    compare: "contre 8–12 seul",
  },
  {
    value: "~10",
    label: "offres pertinentes par jour",
    compare: "contre 200+ à trier seul",
  },
] as const;

export function LandingStatsFilet() {
  return (
    <div className="landing-stats-filet" aria-label="Chiffres clés ARTEMSI">
      <div className="landing-container">
        <ul className="landing-stats-filet-row">
          {STATS.map((stat) => (
            <li
              key={stat.label}
              className={`landing-stats-filet-item${stat.value === "5–8 sem." ? " landing-stats-filet-item--mobile" : ""}`}
            >
              <strong className="landing-stats-filet-value">{stat.value}</strong>
              <span className="landing-stats-filet-label">{stat.label}</span>
              <span className="landing-stats-filet-compare">{stat.compare}</span>
            </li>
          ))}
        </ul>
        <p className="landing-stats-filet-note">
          Moyennes observées en 2025 chez les candidats ARTEMSI Pro · selon profil et secteur
        </p>
      </div>
    </div>
  );
}
