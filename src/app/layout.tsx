import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});
import { TourProvider } from "@/components/layout/TourProvider";
import ThemeProvider from "@/components/layout/ThemeProvider";
import SidebarWrapper from "@/components/layout/SidebarWrapper";
import StartPageGuard from "@/components/layout/StartPageGuard";

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
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6B8F71",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ colorScheme: "light" }} className={nunito.variable}>
      <body className="pb-20">
        <ThemeProvider>
          <TourProvider>
            <StartPageGuard />
            <SidebarWrapper />
            <main
              className="max-w-lg mx-auto pt-14"
            >
              {children}
            </main>
            <BottomNav />
          </TourProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
