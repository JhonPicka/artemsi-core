import * as Sentry from "@sentry/nextjs";

// Monitoring client : actif uniquement si NEXT_PUBLIC_SENTRY_DSN est défini (Vercel / .env.local).
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "production",
    tracesSampleRate: 0.1,
    // Capture toutes les erreurs JS non gérées (ex. le crash Safari "Invalid Date").
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
