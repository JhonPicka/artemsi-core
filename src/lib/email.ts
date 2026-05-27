import { env } from "@/lib/env";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!env.RESEND_API_KEY) {
    console.info("[email] RESEND_API_KEY missing, skipping email", { to, subject });
    return { ok: false, skipped: true } as const;
  }

  const from = env.MAIL_FROM ?? "ARTEMSI <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[email] Resend error", response.status, errorBody);
    return { ok: false, skipped: false, error: errorBody } as const;
  }

  return { ok: true } as const;
}

export function getAppUrl() {
  return env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function getAdminEmail() {
  return env.ADMIN_EMAIL ?? null;
}
