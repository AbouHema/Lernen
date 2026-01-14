import "./globals.css";

import type { Metadata } from "next";

import { AppProvider } from "@/components/providers";

export const metadata: Metadata = {
  title: "Lernen – Deutsch lernen für arabische Lernende",
  description: "Moderne Lernplattform für Deutsch mit arabischer Übersetzung."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
