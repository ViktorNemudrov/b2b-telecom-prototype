"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useDemoSession } from "@shared/components/DemoSessionProvider";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { formatRuMobileMask } from "@shared/lib/phoneMaskRu";
import { goSmartBack } from "@shared/lib/smartBack";

export function AuthPhoneScreen({
  backHref = "/",
  afterSignInHref = "/assistant/?promo=1"
}: {
  backHref?: string;
  afterSignInHref?: string;
}) {
  const router = useRouter();
  const { signIn } = useDemoSession();
  const [phone, setPhone] = useState("+7 ");

  const submit = () => {
    signIn();
    router.push(afterSignInHref);
  };

  return (
    <div className="safe-px flex min-h-dvh flex-col bg-[rgb(var(--bg))] text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200/80 bg-[rgb(var(--bg))]/95 pt-3 pb-3 backdrop-blur">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-softSm transition hover:bg-slate-50"
          aria-label="Назад"
          onClick={() => goSmartBack(router, backHref)}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => openDevelopmentStub("Справка по входу появится в релизе.")}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold tracking-wide text-slate-700 shadow-softSm transition hover:bg-slate-50"
        >
          ПОМОЩЬ
        </button>
      </header>

      <h1 className="mt-10 text-[32px] font-medium lowercase leading-tight tracking-tight text-slate-900">
        введите номер
      </h1>

      <div
        className="mt-5 rounded-2xl border-2 border-accent-yellow/70 bg-amber-50/90 px-4 py-3.5 text-center shadow-softSm"
        role="note"
      >
        <p className="text-[15px] font-bold leading-snug text-amber-900">Введите любой номер</p>
        <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-600">
          Для демо подойдут любые цифры после +7 — вход сработает в любом случае.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-softSm">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">логин</label>
        <div className="relative mt-2 flex items-center border-b border-slate-200 pb-2">
          <input
            value={phone}
            onChange={(e) => setPhone(formatRuMobileMask(e.target.value))}
            className="w-full bg-transparent text-2xl font-medium tracking-tight text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="+7 961 416 24 34"
            inputMode="tel"
            autoComplete="tel"
          />
          <button
            type="button"
            onClick={() => setPhone("+7 ")}
            className="ml-2 px-2 text-xl leading-none text-slate-400 transition hover:text-slate-600"
            aria-label="Очистить"
          >
            ×
          </button>
        </div>
        <button
          type="button"
          onClick={() => openDevelopmentStub("Вход по логину и паролю пока в разработке.")}
          className="mt-6 text-left text-sm font-semibold text-accent-violet underline-offset-4 hover:underline"
        >
          или войдите по логину и паролю
        </button>
      </div>

      <div className="mt-auto pb-[max(28px,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={submit}
          className="w-full rounded-2xl bg-accent-yellow py-4 text-base font-bold lowercase text-accent-dark shadow-soft transition hover:brightness-95 active:translate-y-[1px]"
        >
          продолжить
        </button>
      </div>
    </div>
  );
}
