import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import { CommandPalette } from "@/components/CommandPalette";
import { CustomCursor } from "@/components/CustomCursor";

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

export const metadata: Metadata = {
  title: "Vaishnav Gadamsetty // Portfolio",
  description: "I build things around intelligence, markets & machines.",
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-full bg-background text-text-primary flex flex-col selection:bg-accent-soft selection:text-accent">
        <CustomCursor />
        {children}
        <CommandPalette />
      </body>
    </html>
  );
}
