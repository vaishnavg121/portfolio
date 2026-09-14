import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";
import React from "react";
import { CommandPalette } from "@/components/CommandPalette";
import { CustomCursor } from "@/components/CustomCursor";
import { CompanionTester } from "@/components/companion/CompanionTester";
import { PointerProvider, SystemRail } from "@/components/effects";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vaishnav Gadamsetty — AI, Finance & Systems",
  description: "Computer Science and Finance student at BITS Pilani Hyderabad building across AI/ML, RAG & agentic systems, quantitative finance, systems and robotics.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
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
        <PointerProvider>
          <CustomCursor />
          <SystemRail />
          {children}
          <CommandPalette />
          <CompanionTester />
        </PointerProvider>
      </body>
    </html>
  );
}
