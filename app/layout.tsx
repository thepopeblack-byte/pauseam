import type { Metadata } from "next";
import "./globals.css";
import { PerformancePanel } from "@/components/performance-panel";

export const metadata: Metadata = {
  title: "PauseAm — Ask before you pay.",
  description:
    "Voice-first, source-linked payment-safety guidance for Nigeria. Research MVP.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <PerformancePanel />
      </body>
    </html>
  );
}
