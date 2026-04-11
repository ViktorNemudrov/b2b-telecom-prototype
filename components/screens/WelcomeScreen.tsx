"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { hasDemoSession } from "@/lib/demoSession";
import { openDevelopmentStub } from "@/lib/developmentStub";

export function WelcomeScreen() {
  const router = useRouter();

  useEffect(() => {
    if (hasDemoSession()) router.replace("/assistant");
  }, [router]);

  return (
    <div className="safe-px flex min-h-dvh flex-col bg-[#121417] text-white">
      <header className="flex items-center justify-between pt-3">
        <Image
          src="/beeline-sphere.svg"
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded-full shadow-md"
        />
        <button
          type="button"
          onClick={() => {
            openDevelopmentStub("Раздел «Помощь» и база знаний.");
          }}
          className="rounded-full bg-[#1E2228] px-4 py-2 text-[11px] font-bold tracking-wide text-white/95 transition hover:bg-[#2a3038]"
        >
          ПОМОЩЬ
        </button>
      </header>

      <div className="mt-10 flex flex-1 flex-col px-1">
        <h1 className="mt-2 text-[34px] font-medium leading-[1.1] tracking-tight">
          <span className="block lowercase text-white">добро пожаловать</span>
          <span className="mt-1 block lowercase">
            <span className="text-white">в </span>
            <span className="relative inline-block font-semibold">
              <span className="text-white">билайн!</span>
              <span className="absolute -bottom-1 left-0 right-0 h-1.5 rounded-full bg-[#FFD429]" aria-hidden />
            </span>
          </span>
        </h1>

        <div className="mt-auto pb-[max(32px,env(safe-area-inset-bottom))]">
          <Link
            href="/auth"
            className="flex w-full items-center justify-center rounded-2xl bg-[#1E2228] py-4 text-base font-semibold lowercase text-white shadow-lg transition hover:bg-[#2a3038] active:translate-y-[1px]"
          >
            войти
          </Link>
        </div>
      </div>
    </div>
  );
}
