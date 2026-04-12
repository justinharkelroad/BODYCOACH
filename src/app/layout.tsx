import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: {
    default: "Standard Nutrition — Coach-Led Fitness & Nutrition",
    template: "%s | Standard Nutrition",
  },
  description: "Personalized nutrition and fitness coaching with progress tracking, macro plans, and accountability.",
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://standardnutrition.com"),
  openGraph: {
    title: "Standard Nutrition — Coach-Led Fitness & Nutrition",
    description: "Personalized nutrition and fitness coaching with progress tracking, macro plans, and accountability.",
    type: "website",
    siteName: "Standard Nutrition",
  },
  twitter: {
    card: "summary_large_image",
    title: "Standard Nutrition — Coach-Led Fitness & Nutrition",
    description: "Personalized nutrition and fitness coaching with progress tracking, macro plans, and accountability.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Standard Nutrition",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/logos/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/logos/icon.png", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/logos/icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
