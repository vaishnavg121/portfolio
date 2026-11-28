import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";
import React from "react";
import { MobileNavigation } from "@/components/MobileNavigation";
import { CommandPalette } from "@/components/CommandPalette";
import { CustomCursor } from "@/components/CustomCursor";
import { TouchFeedback } from "@/components/TouchFeedback";
import { CompanionTester } from "@/components/companion/CompanionTester";
import { PointerProvider, SystemRail } from "@/components/effects";
import { Companion } from "@/components/companion";

const inter = Inter({
  variable: "--portfolio-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--portfolio-display",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--portfolio-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--portfolio-hand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vaishnav Gadamsetty — AI, Finance & Systems",
  description: "Computer Science and Finance student at BITS Pilani Hyderabad building across AI/ML, RAG & agentic systems, quantitative finance, systems and robotics.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

const entryBootstrap = `(() => {
  if (location.pathname !== "/" || location.hash || document.hidden ||
    matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const debug = ${process.env.NODE_ENV === "development"} && new URLSearchParams(location.search).get("entry");
  if (debug === "off") return;
  try {
    if (!debug && sessionStorage.getItem("portfolio-signature-v1")) return;
    if (!debug) sessionStorage.setItem("portfolio-signature-v1", "1");
  } catch { return; }
  const root = document.documentElement;
  root.dataset.entryPending = String(performance.now());
  const release = () => {
    delete root.dataset.entryPending;
    for (const type of ["pointerdown","keydown","scroll","visibilitychange"])
      window.removeEventListener(type, release);
  };
  for (const type of ["pointerdown","keydown","scroll","visibilitychange"])
    window.addEventListener(type, release, {passive:true});
  setTimeout(release, 1380);
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${caveat.variable} antialiased`}
    >
      <head><script dangerouslySetInnerHTML={{ __html: entryBootstrap }} /></head>
      <body className="min-h-full bg-background text-text-primary flex flex-col selection:bg-accent-soft selection:text-accent">
        <div className="portfolio-content">
          <PointerProvider>
            <CustomCursor />
            <TouchFeedback />
            <SystemRail />
            <MobileNavigation />
            {children}
            <CommandPalette />
            <CompanionTester />
          </PointerProvider>
        </div>
        <div id="familiar-root" aria-hidden="true">
          <Companion />
        </div>
      </body>
    </html>
  );
}
