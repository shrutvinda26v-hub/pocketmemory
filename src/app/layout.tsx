import type { Metadata } from "next";
import { Anton, Bodoni_Moda, Outfit, Teko } from "next/font/google";
import { Providers } from "@/components/Experience";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  style: ["normal", "italic"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const teko = Teko({
  subsets: ["latin"],
  variable: "--font-teko",
});

export const metadata: Metadata = {
  title: "BADDIE — Wear Your Mood",
  description:
    "One woman. Many moods. One BADDIE. An Indian maximalist lipstick universe of caricatures, colour worlds, and cinematic scroll.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${bodoni.variable} ${outfit.variable} ${teko.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
