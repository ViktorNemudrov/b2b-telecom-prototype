"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDemoSession } from "@shared/components/DemoSessionProvider";
import { openDevelopmentStub } from "@shared/lib/developmentStub";

export function WelcomeScreen({
  loginHref = "/auth",
  whenAuthedHref = "/assistant/"
}: {
  /** Куда вести кнопку «войти» */
  loginHref?: string;
  /** Куда перенаправить уже авторизованного пользователя */
  whenAuthedHref?: string;
}) {
  const router = useRouter();
  const { authenticated } = useDemoSession();

  useEffect(() => {
    if (authenticated) router.replace(whenAuthedHref);
  }, [authenticated, router, whenAuthedHref]);

  return (
    <div className="safe-px flex min-h-dvh flex-col bg-[rgb(var(--bg))] text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200/80 bg-[rgb(var(--bg))]/95 pt-3 pb-3 backdrop-blur">
        <Image
          src="/beeline-sphere.svg"
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded-full shadow-softSm ring-1 ring-slate-200/80"
        />
        <button
          type="button"
          onClick={() => {
            openDevelopmentStub("Раздел «Помощь» и база знаний.");
          }}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold tracking-wide text-slate-700 shadow-softSm transition hover:bg-slate-50"
        >
          ПОМОЩЬ
        </button>
      </header>

      <div className="mt-10 flex flex-1 flex-col px-1">
        <h1 className="mt-2 text-[34px] font-medium leading-[1.1] tracking-tight">
          <span className="block lowercase text-slate-900">добро пожаловать</span>
          <span className="mt-1 block lowercase">
            <span className="text-slate-700">в </span>
            <span className="relative inline-block font-semibold">
              <span className="text-slate-900">билайн!</span>
              <span className="absolute -bottom-1 left-0 right-0 h-1.5 rounded-full bg-accent-yellow" aria-hidden />
            </span>
          </span>
        </h1>

        <div className="mt-auto pb-[max(32px,env(safe-area-inset-bottom))]">
          <Link
            href={loginHref}
            className="flex w-full items-center justify-center rounded-2xl bg-accent-dark py-4 text-base font-semibold lowercase text-white shadow-soft transition hover:brightness-110 active:translate-y-[1px]"
          >
            войти
          </Link>
        </div>
      </div>
    </div>
  );
}
