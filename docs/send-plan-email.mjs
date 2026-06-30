#!/usr/bin/env node
/**
 * Envoie le plan PDF par email via Resend.
 * Usage: RESEND_API_KEY=re_xxx node docs/send-plan-email.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PDF_PATH = join(__dirname, "plan-croissance-artemsi-2026.pdf");
const TO = "jhon95@hotmail.fr";
const FROM = process.env.MAIL_FROM ?? "ARTEMSI <onboarding@resend.dev>";
const API_KEY = process.env.RESEND_API_KEY;

if (!API_KEY) {
  console.error("RESEND_API_KEY manquant. Ajoute-le dans app/.env.local puis relance.");
  process.exit(1);
}

const pdfBase64 = readFileSync(PDF_PATH).toString("base64");

const response = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: FROM,
    to: [TO],
    subject: "ARTEMSI - Plan de croissance 2026 (PDF)",
    html: `
      <p>Bonjour Jhon,</p>
      <p>Voici le <strong>plan de croissance ARTEMSI</strong> en pièce jointe :</p>
      <ul>
        <li>Objectifs prudent / réaliste / stretch</li>
        <li>Plan jour par jour — semaine 1</li>
        <li>Préparation technique et organisationnelle</li>
        <li>Rituel hebdomadaire de pilotage</li>
      </ul>
      <p><strong>Demain — 3 actions :</strong></p>
      <ol>
        <li>Créer l'offre lancement Stripe</li>
        <li>Envoyer 30 DMs personnalisés</li>
        <li>Publier 1 post LinkedIn</li>
      </ol>
      <p>À demain,<br/>ARTEMSI</p>
    `,
    attachments: [
      {
        filename: "plan-croissance-artemsi-2026.pdf",
        content: pdfBase64,
      },
    ],
  }),
});

const result = await response.json();
if (!response.ok) {
  console.error("Erreur Resend:", result);
  process.exit(1);
}

console.log("Email envoyé à", TO, "- id:", result.id);
