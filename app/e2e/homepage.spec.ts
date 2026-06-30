import { test, expect } from "@playwright/test";

/**
 * Garde anti-régression du bug réel : la homepage plantait sur Safari/WebKit
 * (RangeError: Invalid Date) → page blanche. Ce test échoue si une erreur JS
 * non gérée survient au rendu de la page d'accueil.
 */
test("la homepage s'affiche sans erreur JS sur WebKit", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page.locator(".landing-hero-title")).toBeVisible();
  await expect(page.locator("main")).toContainText("alternance");

  expect(errors, `Erreurs JS détectées: ${errors.join(" | ")}`).toEqual([]);
});
