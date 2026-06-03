"use client";

const sphereFallbackSrc = "/mockups/Шар.png";

/**
 * Стабильный экран запуска: шар + пульсация + подписи бренда.
 */
export function LaunchScreen() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-[rgb(var(--bg))] px-4">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{ background: "radial-gradient(ellipse 90% 55% at 50% 105%, rgba(180,75,15,0.42) 0%, rgba(130,45,8,0.20) 48%, transparent 72%)" }}
      />
      <div className="relative flex flex-col items-center">
        <div className="launch-sphere-pulse h-[160px] w-[160px] overflow-hidden rounded-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sphereFallbackSrc}
            alt=""
            width={160}
            height={160}
            decoding="async"
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mt-4 inline-flex items-center gap-2">
          <span className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-1 text-[16px] font-medium text-[rgb(var(--text))]">Билайн</span>
          <span className="rounded-full bg-accent-orange px-4 py-1 text-[16px] font-medium text-white">One</span>
        </div>
        <p className="mt-3 text-[22px] font-semibold tracking-tight text-[rgb(var(--text))]">Просто. Для бизнеса</p>
        <p className="mt-2 max-w-[320px] text-center text-[14px] leading-relaxed text-[rgb(var(--muted))]">
          Новая эра во взаимодействии с Билайн Бизнес
        </p>
      </div>
    </div>
  );
}
