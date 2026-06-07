import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { themeBootstrapScript } from "@/components/theme/theme-bootstrap";
import { ThemeProvider } from "@/components/theme/theme-context";
import { ToastProvider } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ARTEMSI — Trouve ton alternance et profite de l'été",
    template: "%s — ARTEMSI",
  },
  description:
    "Trouve ton alternance plus vite : offres ciblées, suivi des candidatures et accompagnement personnalisé dans un seul espace.",
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
      <head>
        <meta name="google" content="notranslate" />
        <script
          dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
        />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
