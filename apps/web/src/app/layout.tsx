import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

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
    url: "https://ecoverseindia.web.app",
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
import { LiveJoinNotification } from "@/components/sections/LiveJoinNotification";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var host = window.location.hostname;
                if (
                  host !== "ecoverseindia.web.app" &&
                  host !== "localhost" &&
                  host !== "127.0.0.1" &&
                  !host.endsWith(".local")
                ) {
                  window.location.replace("https://ecoverseindia.web.app" + window.location.pathname + window.location.search + window.location.hash);
                  return;
                }

                // Failsafe: detect Supabase password recovery flow and redirect to reset-password page
                var path = window.location.pathname;
                var search = window.location.search;
                var hash = window.location.hash;
                var isRecovery = hash.indexOf("type=recovery") !== -1 || hash.indexOf("access_token=") !== -1 || search.indexOf("code=") !== -1;
                
                if (isRecovery && path !== "/reset-password" && path !== "/reset-password/") {
                  window.location.replace(window.location.protocol + "//" + window.location.host + "/reset-password" + search + hash);
                }
              })();
            `
          }}
        />
        <meta name="google-adsense-account" content="ca-pub-8150181705727957" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body style={{ background: "#050f07", margin: 0 }} suppressHydrationWarning>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8150181705727957"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <AuthProvider>
          <PixelSphere />
          <LiveJoinNotification />
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

