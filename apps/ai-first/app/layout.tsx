import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DemoSessionProvider } from "@shared/components/DemoSessionProvider";
import { DevelopmentStubHost } from "@shared/components/DevelopmentStubHost";
import { SessionGate } from "@shared/components/SessionGate";
import { ThemeProvider } from "@shared/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Билайн.One",
  description: "Билайн.One — AI ассистент для бизнеса"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`min-h-dvh antialiased ${inter.variable} font-sans`}>
        <div className="relative mx-auto min-h-dvh w-full max-w-[430px]">
          <ThemeProvider>
            <DemoSessionProvider>
              <SessionGate publicPaths={["/"]} unauthenticatedRedirect="/">
                {children}
              </SessionGate>
              <DevelopmentStubHost />
            </DemoSessionProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}

