import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "EcoVerse — One Earth. One Community. Infinite Compassion.",
  description:
    "EcoVerse connects vegans, animal lovers, rescuers, NGOs, feeders, adopters, and volunteers across India. Rescue faster. Organize better. Protect together.",
  keywords: [
    "animal rescue India",
    "vegan community India",
    "animal adoption",
    "volunteer network",
    "NGO directory",
    "EcoVerse",
    "animal welfare platform",
    "Hyderabad animal rescue",
  ],
  authors: [{ name: "Anti Gravity Studio" }],
  creator: "Anti Gravity Studio",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://ecoverse.in",
    siteName: "EcoVerse",
    title: "EcoVerse — One Earth. One Community. Infinite Compassion.",
    description:
      "India's first unified platform for animal welfare — rescue, adopt, connect, and protect together.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EcoVerse — One Earth. One Community.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EcoVerse — One Earth. One Community.",
    description:
      "India's first unified platform for animal welfare.",
    creator: "@ecoversein",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

import PixelSphere from "@/components/PixelSphere";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body style={{ background: "#050f07", margin: 0 }}>
        <AuthProvider>
          <PixelSphere />
          <div style={{ position: "relative", zIndex: 1 }}>
            {children}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#152317",
                color: "#FAFAF8",
                border: "1px solid rgba(102, 187, 106, 0.2)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

