"use client";

const sphereFallbackSrc = "/mockups/Шар.png";

/**
 * Стабильный экран запуска: шар + пульсация + подписи бренда.
 * Тёмный стиль по дизайну Figma.
 */
export function LaunchScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[rgb(var(--bg))] px-4">
      <div className="flex flex-col items-center">
        <div className="launch-sphere-pulse h-[160px] w-[160px] overflow-hidden rounded-full shadow-[0_0_60px_rgba(255,107,53,0.25)]">
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

        <div className="mt-6 inline-flex items-center gap-2">
          <span className="rounded-full bg-[rgb(var(--card))] px-4 py-1.5 text-[15px] font-semibold text-[rgb(var(--text))] border border-[rgb(var(--border))]">Билайн</span>
          <span className="rounded-full bg-accent-orange px-4 py-1.5 text-[15px] font-semibold text-white">One</span>
        </div>
        <p className="mt-4 text-[22px] font-bold tracking-tight text-[rgb(var(--text))]">Просто. Для бизнеса</p>
        <p className="mt-2 max-w-[300px] text-center text-[14px] leading-relaxed text-[rgb(var(--muted))]">
          Новая эра во взаимодействии с Билайн Бизнес
        </p>
      </div>
    </div>
  );
}

