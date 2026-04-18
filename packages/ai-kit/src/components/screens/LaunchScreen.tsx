"use client";

const sphereFallbackSrc = "/mockups/Шар.png";

/**
 * Стабильный экран запуска: шар + пульсация + подписи бренда.
 */
export function LaunchScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[rgb(var(--bg))] px-4">
      <div className="flex flex-col items-center">
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
          <span className="rounded-full bg-[#2F3141] px-4 py-1 text-[16px] font-medium text-white">Билайн</span>
          <span className="rounded-full bg-[#FFD429] px-4 py-1 text-[16px] font-medium text-[#2F3141]">One</span>
        </div>
        <p className="mt-3 text-[22px] font-semibold tracking-tight text-[#2F3141]">Просто. Для бизнеса</p>
        <p className="mt-2 max-w-[320px] text-center text-[14px] leading-relaxed text-[#5A6376]">
          Новая эра во взаимодействии с Билайн Бизнес
        </p>
      </div>
    </div>
  );
}
