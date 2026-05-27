export const THEME_STORAGE_KEY = "artemsi-theme";

/**
 * Inline script injected in <head> *before* React hydration.
 * Sets `data-theme` on <html> from localStorage (or system preference) so we
 * never see a dark→light flash for users who picked the light theme.
 *
 * Kept in a server-safe module (no "use client") so it is actually inlined in
 * the HTML output instead of being serialized as a client reference.
 */
export const themeBootstrapScript = `
(function () {
  try {
    var stored = window.localStorage.getItem("${THEME_STORAGE_KEY}");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = "dark";
  }
})();
`;
