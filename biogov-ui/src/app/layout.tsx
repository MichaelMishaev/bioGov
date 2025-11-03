import type { Metadata, Viewport } from "next";
import { Inter, Heebo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import OfflineIndicator from "@/components/OfflineIndicator";
import { HomeButton } from "@/components/HomeButton";
import { SkipToContent } from "@/components/SkipToContent";
import { HelpButton } from "@/components/HelpButton";

// Inter for Latin text and numbers - excellent for data display
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

// Heebo for Hebrew text - modern, clean, RTL-optimized
const heebo = Heebo({
  subsets: ["hebrew"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-heebo",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#3B82F6", // Modern Professional blue
};

export const metadata: Metadata = {
  title: "bioGov - ניהול ציות עסקי",
  description: "מערכת לניהול ציות ממשלתי לעסקים קטנים ובינוניים בישראל",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "bioGov",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${inter.variable} ${heebo.variable}`}>
      <body className="font-sans antialiased bg-background" style={{ fontFamily: 'var(--font-heebo), var(--font-inter), system-ui, sans-serif' }}>
        {/* Skip to content link - First focusable element for keyboard users */}
        <SkipToContent />

        <OfflineIndicator />
        <AuthProvider>
          {/* Fixed Navigation Buttons - Top Corners */}
          <div className="fixed top-4 left-4 z-[60]">
            <HomeButton variant="outline" size="icon" className="shadow-lg bg-white/90 hover:bg-white backdrop-blur-sm" aria-label="חזרה לדף הבית" />
          </div>

          {/* Help Button - Top Right Corner */}
          <div className="fixed top-4 right-4 z-[60]">
            <HelpButton />
          </div>

          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
