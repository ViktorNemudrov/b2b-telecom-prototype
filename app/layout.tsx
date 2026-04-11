import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DevelopmentStubHost } from "@/components/DevelopmentStubHost";
import { SessionGate } from "@/components/SessionGate";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "B2B Telecom — Mobile Prototype",
  description: "Минималистичный прототип B2B telecom app"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`min-h-dvh antialiased ${inter.variable} font-sans`}>
        <div className="relative mx-auto min-h-dvh w-full max-w-[430px]">
          <SessionGate>{children}</SessionGate>
          <DevelopmentStubHost />
        </div>
      </body>
    </html>
  );
}

