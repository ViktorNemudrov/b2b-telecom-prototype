import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DemoSessionProvider } from "@shared/components/DemoSessionProvider";
import { DevelopmentStubHost } from "@shared/components/DevelopmentStubHost";
import { SessionGate } from "@shared/components/SessionGate";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "B2B Telecom — Классика",
  description: "Классический мобильный прототип: главный экран — кабинет, AI отдельной вкладкой"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`min-h-dvh antialiased ${inter.variable} font-sans`}>
        <div className="relative mx-auto min-h-dvh w-full max-w-[430px]">
          <DemoSessionProvider>
            <SessionGate publicPaths={["/welcome", "/auth"]} unauthenticatedRedirect="/welcome">
              {children}
            </SessionGate>
            <DevelopmentStubHost />
          </DemoSessionProvider>
        </div>
      </body>
    </html>
  );
}
