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
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Standard Nutrition" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Standard Nutrition — Coach-Led Fitness & Nutrition",
    description: "Personalized nutrition and fitness coaching with progress tracking, macro plans, and accountability.",
    images: ["/og-image.png"],
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
      { url: "/app-icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/app-icon.png", type: "image/png" },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/app-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Resolve color scheme before paint so the first frame matches the
            user's preference — eliminates the light-flash on dark-mode loads.
            When the v2 flag is on, force light theme + mark the root with
            data-v2 so loading screens and public pages also pick up the
            aurora palette overrides defined in globals.css. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var v2=${process.env.NEXT_PUBLIC_NEW_UI === '1' || process.env.NEXT_PUBLIC_NEW_UI === 'true' ? 'true' : 'false'};var s=localStorage.getItem('color-scheme');var m=v2?'light':((s==='dark'||s==='light')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));document.documentElement.setAttribute('data-theme',m);if(v2)document.documentElement.setAttribute('data-v2','1');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
