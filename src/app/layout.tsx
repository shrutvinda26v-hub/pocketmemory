import type { Metadata } from "next";
import { Cormorant_Garamond, Figtree, Instrument_Serif } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const body = Instrument_Serif({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const ui = Figtree({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "BONSAI — A Story That Grows",
  description:
    "An immersive scroll experience where a bonsai evolves from seed to maturity — craft, calm, and quiet growth.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${ui.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
