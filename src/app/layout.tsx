import type { Metadata } from "next";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { themeBootstrapScript } from "@/components/theme/theme-bootstrap";
import { ThemeProvider } from "@/components/theme/theme-context";
import { ToastProvider } from "@/components/ui/toast";
import { billingProAuditShortLabel } from "@/lib/billing-offer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://artemsi.fr";

export const metadata: Metadata = {
  title: {
    default: "ARTEMSI — Plateforme alternance ingénieur & industrie | Offres ciblées, suivi et accompagnement",
    template: "%s — ARTEMSI",
  },
  description: `Trouve ton alternance en ingénierie et industrie partout en France. Offres matchées sur ton profil, suivi candidatures, guides CV/LM et ${billingProAuditShortLabel()}. Inscription gratuite.`,
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "ARTEMSI",
    title: "ARTEMSI — Plateforme alternance ingénieur & industrie",
    description:
      "Offres ciblées, suivi candidatures et accompagnement humain pour décrocher ton alternance en ingénierie et industrie partout en France.",
    images: [
      {
        url: "/artemsi-logo.png",
        width: 512,
        height: 512,
        alt: "ARTEMSI — Plateforme alternance ingénieur & industrie",
      },
    ],
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "ARTEMSI — Plateforme alternance ingénieur & industrie",
    description:
      "Offres ciblées, suivi candidatures et accompagnement humain pour décrocher ton alternance en France.",
    images: ["/artemsi-logo.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/jpeg" },
      { url: "/artemsi-logo.png", type: "image/jpeg" },
    ],
    apple: "/artemsi-logo.png",
    shortcut: "/artemsi-logo.png",
  },
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} notranslate`}
      suppressHydrationWarning
    >
      <body>
        <Script
          id="theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
        />
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
