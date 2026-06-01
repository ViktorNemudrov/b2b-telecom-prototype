import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClassicShellProviders } from "../components/ClassicShellProviders";
import { DemoSessionProvider } from "@shared/components/DemoSessionProvider";
import { DevelopmentStubHost } from "@shared/components/DevelopmentStubHost";
import { SessionGate } from "@shared/components/SessionGate";
import { ThemeProvider } from "@shared/components/ThemeProvider";
import { UiCustomizationProvider } from "@shared/lib/uiCustomization";
import { PwaInstallPrompt } from "./PwaInstallPrompt";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter"
});

const CLASSIC_THEME_BOOTSTRAP_SCRIPT = `
(() => {
  try {
    const storageKey = "b2b_theme_mode_v1";
    const raw = window.localStorage.getItem(storageKey);
    const mode = raw === "light" || raw === "dark" || raw === "system" ? raw : "dark";
    const resolved = mode === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : mode;
    const root = document.documentElement;
    if (resolved === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  } catch {
    // noop
  }
})();
`;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F5F7" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0D1A" }
  ],
  viewportFit: "cover"
};

export const metadata: Metadata = {
  title: "Билайн.One",
  description: "Билайн.One — AI ассистент для бизнеса",
  icons: {
    icon: [
      { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    shortcut: [{ url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" }]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: CLASSIC_THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className={`min-h-dvh bg-[#F4F5F7] antialiased dark:bg-[#0D0D1A] ${inter.variable} font-sans`}>
        <div className="relative mx-auto min-h-dvh w-full max-w-[430px]">
          <ThemeProvider>
            <DemoSessionProvider>
              <UiCustomizationProvider>
                <SessionGate
                  publicPaths={["/", "/onboarding", "/onboarding/", "/settings/onboarding", "/settings/onboarding/"]}
                  unauthenticatedRedirect="/"
                >
                  <ClassicShellProviders>{children}</ClassicShellProviders>
                </SessionGate>
                <PwaInstallPrompt />
                <DevelopmentStubHost />
              </UiCustomizationProvider>
            </DemoSessionProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}

