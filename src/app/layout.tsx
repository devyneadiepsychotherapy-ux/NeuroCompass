import type { Metadata, Viewport } from "next";
import { Nunito, Playfair_Display } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
import { TourProvider } from "@/components/layout/TourProvider";
import ThemeProvider from "@/components/layout/ThemeProvider";
import SidebarWrapper from "@/components/layout/SidebarWrapper";
import StartPageGuard from "@/components/layout/StartPageGuard";
import ReminderManager from "@/components/layout/ReminderManager";
import { Analytics } from "@vercel/analytics/react";
// ServiceWorkerRegistration replaced by inline script in <head>;

export const metadata: Metadata = {
  title: "NeuroCompass",
  description: "Your neurodivergent-affirming companion for everyday life",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NeuroCompass",
  },
  icons: {
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#B8D0AE",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ colorScheme: "light" }} className={`${nunito.variable} ${playfair.variable}`}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        {/* Register service worker as early as possible — before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .catch(function(err) { console.error('SW registration failed:', err); });
  });
}
            `.trim(),
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <TourProvider>
<StartPageGuard />
            <ReminderManager />
            <SidebarWrapper />
            <main
              className="max-w-lg mx-auto"
              style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))" }}
            >
              {children}
            </main>
            <BottomNav />
          </TourProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
