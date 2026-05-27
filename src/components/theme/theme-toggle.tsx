"use client";

import { useTheme } from "@/components/theme/theme-context";

type Variant = "compact" | "card";

type Props = {
  variant?: Variant;
  className?: string;
};

function MoonIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.4 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.4 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function ThemeToggle({ variant = "compact", className }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  const wrapperClass = [
    "theme-toggle",
    `theme-toggle--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClass} role="group" aria-label="Bascule thème clair / sombre">
      {variant === "card" ? (
        <div className="theme-toggle-text">
          <p className="theme-toggle-title">Apparence</p>
          <p className="theme-toggle-sub muted">
            Bascule entre le thème sombre (par défaut) et le thème clair.
          </p>
        </div>
      ) : null}
      <div className="theme-toggle-control">
        <span
          className={`theme-toggle-side${!isLight ? " is-active" : ""}`}
          aria-hidden="true"
        >
          <MoonIcon active={!isLight} />
          <span className="theme-toggle-label">Sombre</span>
        </span>
        <button
          type="button"
          className="dash-ios-switch theme-toggle-switch"
          data-state={isLight ? "on" : "off"}
          onClick={toggleTheme}
          aria-pressed={isLight}
          aria-label={
            isLight ? "Passer en thème sombre" : "Passer en thème clair"
          }
        >
          <span className="dash-ios-switch-thumb" aria-hidden="true" />
        </button>
        <span
          className={`theme-toggle-side${isLight ? " is-active" : ""}`}
          aria-hidden="true"
        >
          <SunIcon active={isLight} />
          <span className="theme-toggle-label">Clair</span>
        </span>
      </div>
    </div>
  );
}
