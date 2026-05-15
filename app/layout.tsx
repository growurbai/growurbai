import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const metadataBaseUrl = (() => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return undefined;
  try {
    return new URL(raw);
  } catch {
    return undefined;
  }
})();

export const metadata: Metadata = {
  ...(metadataBaseUrl ? { metadataBase: metadataBaseUrl } : {}),
  title: {
    default: "GrowUrb AI | Product Photos to Premium Brand Ads",
    template: "%s | GrowUrb AI",
  },
  description:
    "AI-powered product photo transformation for D2C brands and Instagram sellers in India. Turn catalog shots into high-end ads in seconds.",
  keywords: [
    "product photography AI",
    "D2C India",
    "Instagram seller",
    "brand ads",
    "AI photo studio",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} min-h-screen overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
