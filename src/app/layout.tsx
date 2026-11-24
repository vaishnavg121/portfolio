import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";
import React from "react";
import { MobileNavigation } from "@/components/MobileNavigation";
import { CommandPalette } from "@/components/CommandPalette";
import { CustomCursor } from "@/components/CustomCursor";
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
  title: "Vaishnav Gadamsetty — Projects and notes",
  description: "I study computer science and finance at BITS Hyderabad. This is a collection of my work in machine learning, software, and robotics.",
};

export const viewport: Viewport = {
  themeColor: "#101112",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${caveat.variable} antialiased`}
    >
      <body className="min-h-full bg-background text-text-primary flex flex-col selection:bg-accent-soft selection:text-accent">
        <div className="portfolio-content">
          <PointerProvider>
            <CustomCursor />
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
