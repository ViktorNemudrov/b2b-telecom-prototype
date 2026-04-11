"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useDemoSession } from "@/components/DemoSessionProvider";
import { openDevelopmentStub } from "@/lib/developmentStub";
import { formatRuMobileMask } from "@/lib/phoneMaskRu";

export function AuthPhoneScreen() {
  const router = useRouter();
  const { signIn } = useDemoSession();
  const [phone, setPhone] = useState("+7 ");

  const submit = () => {
    signIn();
    router.push("/assistant?promo=1");
  };

  return (
    <div className="safe-px flex min-h-dvh flex-col bg-[#121417] text-white">
      <header className="flex items-center justify-between pt-3">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E2228] text-white transition hover:bg-[#2a3038]"
          aria-label="Назад"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <button
          type="button"
          onClick={() => openDevelopmentStub("Справка по входу появится в релизе.")}
          className="rounded-full bg-[#1E2228] px-4 py-2 text-[11px] font-bold tracking-wide text-white/95 transition hover:bg-[#2a3038]"
        >
          ПОМОЩЬ
        </button>
      </header>

      <h1 className="mt-10 text-[32px] font-medium lowercase leading-tight tracking-tight">введите номер</h1>

      <div
        className="mt-5 rounded-2xl border-2 border-[#FFD429] bg-[#FFD429]/12 px-4 py-3.5 text-center shadow-[0_0_24px_rgba(255,212,41,0.12)]"
        role="note"
      >
        <p className="text-[15px] font-bold leading-snug text-[#FFD429]">Введите любой номер</p>
        <p className="mt-1.5 text-xs font-medium leading-relaxed text-white/75">
          Для демо подойдут любые цифры после +7 — вход сработает в любом случае.
        </p>
      </div>

      <div className="mt-8">
        <label className="text-xs font-medium uppercase tracking-wide text-white/45">логин</label>
        <div className="relative mt-2 flex items-center border-b border-white/25 pb-2">
          <input
            value={phone}
            onChange={(e) => setPhone(formatRuMobileMask(e.target.value))}
            className="w-full bg-transparent text-2xl font-medium tracking-tight text-white outline-none placeholder:text-white/30"
            placeholder="+7 961 416 24 34"
            inputMode="tel"
            autoComplete="tel"
          />
          <button
            type="button"
            onClick={() => setPhone("+7 ")}
            className="ml-2 px-2 text-xl leading-none text-white/40 transition hover:text-white/70"
            aria-label="Очистить"
          >
            ×
          </button>
        </div>
        <button
          type="button"
          onClick={() => openDevelopmentStub("Вход по логину и паролю пока в разработке.")}
          className="mt-6 text-left text-sm font-medium text-white/90 underline-offset-4 hover:underline"
        >
          или войдите по логину и паролю
        </button>
      </div>

      <div className="mt-auto pb-[max(28px,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={submit}
          className="w-full rounded-2xl bg-[#FFD429] py-4 text-base font-bold lowercase text-[#121417] shadow-lg transition hover:brightness-95 active:translate-y-[1px]"
        >
          продолжить
        </button>
      </div>
    </div>
  );
}
