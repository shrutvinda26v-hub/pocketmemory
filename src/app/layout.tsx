import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Living Tree — Awaken the Forest",
  description:
    "A cinematic interactive experience. Move your hand and watch an ancient tree come alive with bioluminescent light.",
  openGraph: {
    title: "The Living Tree",
    description: "Move your hand. Watch it come alive.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`}>
      <head>
        <link rel="preload" as="image" href="/assets/tree-base-dark.webp" type="image/webp" />
        <link rel="preload" as="image" href="/assets/tree-glow-awake.webp" type="image/webp" />
        <link rel="preload" as="image" href="/assets/butterfly.webp" type="image/webp" />
        <link rel="prefetch" as="image" href="/assets/tree-ember-base.webp" type="image/webp" />
        <link rel="prefetch" as="image" href="/assets/tree-ember-glow.webp" type="image/webp" />
        <link rel="prefetch" as="image" href="/assets/tree-jade-base.webp" type="image/webp" />
        <link rel="prefetch" as="image" href="/assets/tree-jade-glow.webp" type="image/webp" />
        <link rel="prefetch" as="image" href="/assets/tree-amethyst-base.webp" type="image/webp" />
        <link rel="prefetch" as="image" href="/assets/tree-amethyst-glow.webp" type="image/webp" />
      </head>
      <body className="min-h-full overflow-hidden bg-[#000814] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
