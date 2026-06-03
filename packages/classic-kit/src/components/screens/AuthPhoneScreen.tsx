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
  afterSignInHref = "/assistant/"
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
    <div className="safe-px flex min-h-dvh flex-col bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
      <header className="flex items-center justify-between border-b border-[rgb(var(--border))]/60 bg-[rgb(var(--bg))]/95 pt-3 pb-3 backdrop-blur">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--muted))] shadow-softSm transition hover:brightness-110"
          aria-label="Назад"
          onClick={() => goSmartBack(router, backHref)}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => openDevelopmentStub("Справка по входу появится в релизе.")}
          className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-2 text-[11px] font-bold tracking-wide text-[rgb(var(--muted))] shadow-softSm transition hover:brightness-110"
        >
          ПОМОЩЬ
        </button>
      </header>

      <h1 className="mt-10 text-[32px] font-medium lowercase leading-tight tracking-tight text-[rgb(var(--text))]">
        введите номер
      </h1>

      <div
        className="mt-5 rounded-2xl border border-accent-orange/40 bg-accent-orange/10 px-4 py-3.5 text-center shadow-softSm"
        role="note"
      >
        <p className="text-[15px] font-bold leading-snug text-accent-orange">Введите любой номер</p>
        <p className="mt-1.5 text-xs font-medium leading-relaxed text-[rgb(var(--muted))]">
          Для демо подойдут любые цифры после +7 — вход сработает в любом случае.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-5 shadow-softSm">
        <label className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">логин</label>
        <div className="relative mt-2 flex items-center border-b border-[rgb(var(--border))] pb-2">
          <input
            value={phone}
            onChange={(e) => setPhone(formatRuMobileMask(e.target.value))}
            className="w-full bg-transparent text-2xl font-medium tracking-tight text-[rgb(var(--text))] outline-none placeholder:text-[rgb(var(--muted))]"
            placeholder="+7 961 416 24 34"
            inputMode="tel"
            autoComplete="tel"
          />
          <button
            type="button"
            onClick={() => setPhone("+7 ")}
            className="ml-2 px-2 text-xl leading-none text-[rgb(var(--muted))] transition hover:text-[rgb(var(--text))]"
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
          className="w-full rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#E8421E] py-4 text-base font-bold lowercase text-white shadow-soft transition hover:brightness-95 active:translate-y-[1px]"
        >
          продолжить
        </button>
      </div>
    </div>
  );
}
