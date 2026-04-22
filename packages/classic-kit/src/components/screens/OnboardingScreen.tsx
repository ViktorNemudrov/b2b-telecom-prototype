"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, X, SendHorizonal } from "lucide-react";

const PWA_PROMPT_READY_AFTER_ONBOARDING_KEY = "b2b_pwa_prompt_ready_after_onboarding_v1";

const onboardingSlides = [
  "generated-onboarding-1",
  "generated-onboarding-2",
  "generated-onboarding-3",
  "generated-onboarding-4"
];
const onboardingReferenceImages = ["/mockups/onboarding-2-user.png", "/mockups/onboarding-3-user.png", "/mockups/onboarding-4-user.png"] as const;
const animatedPrompts = ["Покажи инсайты по звонкам", "Запустить таргет рассылку", "Открой записи разговоров"];
const typingCharMsByPhrase = [57, 54, 56];
const deletingCharMsByPhrase = [29, 27, 30];
const holdAtEndMsByPhrase = [870, 810, 940];
const holdBeforeNextPhraseMsByPhrase = [180, 160, 190];
const spaceExtraMsByPhrase = [26, 24, 25];

function useAnimatedPrompt() {
  const [phraseIndex, setPhraseIndex] = React.useState(0);
  const [charIndex, setCharIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isStarting, setIsStarting] = React.useState(true);

  React.useEffect(() => {
    const currentPhrase = animatedPrompts[phraseIndex];
    const atPhraseEnd = charIndex >= currentPhrase.length;
    const atPhraseStart = charIndex <= 0;
    const holdAtEndMs = holdAtEndMsByPhrase[phraseIndex] ?? 900;
    let timeoutMs = isDeleting
      ? deletingCharMsByPhrase[phraseIndex] ?? 28
      : typingCharMsByPhrase[phraseIndex] ?? 56;

    if (isStarting) {
      timeoutMs = 180;
    } else if (!isDeleting && atPhraseEnd) {
      timeoutMs = holdAtEndMs;
    } else if (isDeleting && atPhraseStart) {
      timeoutMs = holdBeforeNextPhraseMsByPhrase[phraseIndex] ?? 170;
    } else if (!isDeleting) {
      const nextChar = currentPhrase[charIndex] ?? "";
      timeoutMs =
        (typingCharMsByPhrase[phraseIndex] ?? 56) + (nextChar === " " ? spaceExtraMsByPhrase[phraseIndex] ?? 25 : 0);
    }

    const timeout = window.setTimeout(() => {
      if (isStarting) {
        setIsStarting(false);
        return;
      }

      if (!isDeleting && atPhraseEnd) {
        setIsDeleting(true);
        return;
      }

      if (isDeleting && atPhraseStart) {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % animatedPrompts.length);
        return;
      }

      setCharIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, timeoutMs);

    return () => window.clearTimeout(timeout);
  }, [charIndex, isDeleting, isStarting, phraseIndex]);

  return animatedPrompts[phraseIndex].slice(0, charIndex);
}

export function OnboardingScreen({ showBack = false, backHref = "/settings/" }: { showBack?: boolean; backHref?: string }) {
  const getCurrentViewportHeight = React.useCallback(() => {
    const visualHeight = window.visualViewport?.height;
    const innerHeight = window.innerHeight;
    const heightCandidates = [visualHeight, innerHeight].filter(
      (value): value is number => typeof value === "number" && Number.isFinite(value) && value > 0
    );
    if (heightCandidates.length === 0) {
      return null;
    }
    return Math.round(Math.min(...heightCandidates));
  }, []);

  const [activeSlide, setActiveSlide] = React.useState(0);
  const [viewportSize, setViewportSize] = React.useState(() => {
    if (typeof window === "undefined") {
      return { width: 390, height: 844 };
    }
    return {
      width: Math.round(window.visualViewport?.width ?? window.innerWidth),
      height: Math.round(window.visualViewport?.height ?? window.innerHeight)
    };
  });
  const [screenHeightPx, setScreenHeightPx] = React.useState<number | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    const visualHeight = window.visualViewport?.height;
    const innerHeight = window.innerHeight;
    const heightCandidates = [visualHeight, innerHeight].filter(
      (value): value is number => typeof value === "number" && Number.isFinite(value) && value > 0
    );
    if (heightCandidates.length === 0) {
      return null;
    }
    return Math.round(Math.min(...heightCandidates));
  });
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const touchCurrentRef = React.useRef<{ x: number; y: number } | null>(null);
  const animatedText = useAnimatedPrompt();

  React.useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const updateSize = () => {
      const visualWidth = Math.round(window.visualViewport?.width ?? window.innerWidth);
      const visualHeight = Math.round(window.visualViewport?.height ?? window.innerHeight);
      setViewportSize({
        width: Math.min(node.clientWidth || visualWidth, visualWidth),
        height: Math.min(node.clientHeight || visualHeight, visualHeight)
      });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    window.addEventListener("resize", updateSize);
    window.visualViewport?.addEventListener("resize", updateSize);
    window.visualViewport?.addEventListener("scroll", updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
      window.visualViewport?.removeEventListener("resize", updateSize);
      window.visualViewport?.removeEventListener("scroll", updateSize);
    };
  }, []);

  React.useEffect(() => {
    const updateScreenHeight = () => {
      setScreenHeightPx(getCurrentViewportHeight());
    };

    updateScreenHeight();
    window.addEventListener("resize", updateScreenHeight);
    window.addEventListener("orientationchange", updateScreenHeight);
    window.visualViewport?.addEventListener("resize", updateScreenHeight);
    window.visualViewport?.addEventListener("scroll", updateScreenHeight);

    return () => {
      window.removeEventListener("resize", updateScreenHeight);
      window.removeEventListener("orientationchange", updateScreenHeight);
      window.visualViewport?.removeEventListener("resize", updateScreenHeight);
      window.visualViewport?.removeEventListener("scroll", updateScreenHeight);
    };
  }, [getCurrentViewportHeight]);

  const imageFrame = React.useMemo(() => {
    const { width, height } = viewportSize;
    return { x: 0, y: 0, width, height };
  }, [viewportSize]);

  const markPwaPromptReadyAfterOnboarding = React.useCallback(() => {
    window.sessionStorage.setItem(PWA_PROMPT_READY_AFTER_ONBOARDING_KEY, "1");
  }, []);

  const finishOnboarding = React.useCallback(() => {
    markPwaPromptReadyAfterOnboarding();
    window.location.assign("/assistant/");
  }, [markPwaPromptReadyAfterOnboarding]);

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const point = event.touches[0];
    if (!point) return;
    touchStartRef.current = { x: point.clientX, y: point.clientY };
    touchCurrentRef.current = { x: point.clientX, y: point.clientY };
  };

  const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const point = event.touches[0];
    if (!point) return;
    touchCurrentRef.current = { x: point.clientX, y: point.clientY };
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current) {
      return;
    }
    const point =
      event.changedTouches[0] ??
      (touchCurrentRef.current
        ? { clientX: touchCurrentRef.current.x, clientY: touchCurrentRef.current.y }
        : null);
    if (!point) {
      touchStartRef.current = null;
      touchCurrentRef.current = null;
      return;
    }
    const start = touchStartRef.current;
    touchStartRef.current = null;
    touchCurrentRef.current = null;

    const deltaX = point.clientX - start.x;
    const deltaY = point.clientY - start.y;
    const swipeThreshold = 18;

    if (Math.abs(deltaX) < swipeThreshold || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      if (activeSlide >= onboardingSlides.length - 1) {
        finishOnboarding();
        return;
      }
      setActiveSlide((prev) => prev + 1);
    }
    if (deltaX > 0 && activeSlide > 0) {
      setActiveSlide((prev) => prev - 1);
    }
  };

  const renderBottomNav = () => {
    const navHeightPx = Math.max(68, Math.round(imageFrame.height * 0.1));
    return (
      <div
        className="fixed inset-x-0 bottom-0 z-40 pointer-events-auto"
        style={{
          height: `${navHeightPx}px`
        }}
      >
        <div className="relative h-full w-full">
          <div className="absolute inset-0 bg-[#f3f3f6] dark:bg-slate-900" />

          <button
            type="button"
            data-testid="onboarding-prev"
            aria-label="Предыдущий экран"
            className="absolute left-[7%] top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#eceef3] text-[#6f7483] shadow-[0_1px_3px_rgba(0,0,0,0.05)] disabled:opacity-35 dark:bg-slate-800 dark:text-slate-300"
            onClick={() => setActiveSlide((prev) => Math.max(0, prev - 1))}
            disabled={activeSlide === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2">
            {onboardingSlides.map((slide, index) => (
              <button
                type="button"
                key={`dot-${slide}`}
                data-testid={`onboarding-dot-${index}`}
                aria-label={`Перейти к экрану ${index + 1}`}
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  index === activeSlide ? "bg-[#1f2230] dark:bg-slate-200" : "bg-[#dde0e8] dark:bg-slate-600"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            data-testid="onboarding-next"
            aria-label="Следующий экран"
            className="absolute right-[7%] top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#eceef3] text-[#2f3241] shadow-[0_1px_3px_rgba(0,0,0,0.05)] disabled:opacity-35 dark:bg-slate-800 dark:text-slate-100"
            onClick={() => {
              if (activeSlide === onboardingSlides.length - 1) {
                finishOnboarding();
                return;
              }
              setActiveSlide((prev) => Math.min(onboardingSlides.length - 1, prev + 1));
            }}
          >
            <ChevronLeft className="h-5 w-5 rotate-180" />
          </button>
        </div>
      </div>
    );
  };

  const rootViewportStyle: React.CSSProperties = screenHeightPx
    ? { minHeight: `${screenHeightPx}px`, height: `${screenHeightPx}px` }
    : { minHeight: "100svh", height: "100svh" };

  const renderGeneratedSlide = (index: number) => {
    if (index === 1) {
      return (
        <div className="h-[90%] w-full overflow-hidden bg-[rgb(var(--bg))] px-4 pb-2 pt-8">
          <div className="mx-auto flex h-full max-w-[360px] min-h-0 flex-col">
            <h2 className="text-[24px] font-normal leading-[1.15] tracking-[-0.03em] text-[#222222] dark:text-slate-100">
              Личный ассистент
              <br />
              для ведения бизнеса
            </h2>
            <p className="mt-2 text-[11px] leading-[1.3] text-[#8F93A2] dark:text-slate-400">
              Сформируйте и задайте запрос в чате, в нем появиться
              <br />
              вся актуальная информация о вашем бизнесе и процессах
            </p>
            <div className="mt-4 min-h-0 flex-1 rounded-2xl bg-[#E8EAF1] p-2">
              <div className="h-full w-full overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={onboardingReferenceImages[0]}
                  alt="Референс онбординга 2"
                  className="h-full w-full scale-[1.12] object-cover"
                  style={{ objectPosition: "center 40%" }}
                  draggable={false}
                />
              </div>
            </div>
            <p className="mt-3 text-[21px] font-normal leading-[1.12] tracking-normal text-[#222222] dark:text-slate-100">
              Ежедневная сводка о состоянии вашего бизнеса и умный помощник в одном окне
            </p>
          </div>
        </div>
      );
    }

    if (index === 2) {
      return (
        <div className="h-[90%] w-full overflow-hidden bg-[rgb(var(--bg))] px-4 pb-2 pt-8">
          <div className="mx-auto flex h-full max-w-[360px] min-h-0 flex-col">
            <h2 className="text-[24px] font-normal leading-[1.15] tracking-[-0.03em] text-[#222222] dark:text-slate-100">
              Только актуальные события
              <br />
              требующие вашего внимания
            </h2>
            <p className="mt-2 text-[11px] leading-[1.3] text-[#8F93A2] dark:text-slate-400">
              Не беспокойтесь пропустить, что-то важное, мы подскажем
              <br />
              когда вам нужно заниматься рутинными делами
            </p>
            <div className="mt-4 min-h-0 flex-1 rounded-2xl bg-[#E8EAF1] p-2">
              <div className="h-full w-full overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={onboardingReferenceImages[1]}
                  alt="Референс онбординга 3"
                  className="h-full w-full scale-[1.06] object-cover"
                  style={{ objectPosition: "center 50%" }}
                  draggable={false}
                />
              </div>
            </div>
            <p className="mt-3 text-[21px] font-normal leading-[1.12] tracking-normal text-[#222222] dark:text-slate-100">
              Важные события, активности и оповещения без лишней воды
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-[90%] w-full overflow-hidden bg-[rgb(var(--bg))] px-4 pb-2 pt-8">
        <div className="mx-auto flex h-full max-w-[360px] min-h-0 flex-col">
          <h2 className="text-[24px] font-normal leading-[1.15] tracking-[-0.03em] text-[#222222] dark:text-slate-100">
            Когда нужно — действуйте
            <br />
            привычным способом
          </h2>
          <p className="mt-2 text-[11px] leading-[1.3] text-[#8F93A2] dark:text-slate-400">Все важные функции собраны в привычном виде</p>
          <div className="mt-4 min-h-0 flex-1 rounded-2xl bg-[#E8EAF1] p-2">
            <div className="h-full w-full overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={onboardingReferenceImages[2]}
                alt="Референс онбординга 4"
                className="h-full w-full scale-[1.12] object-cover"
                style={{ objectPosition: "center 40%" }}
                draggable={false}
              />
            </div>
          </div>
          <p className="mt-3 text-[21px] font-normal leading-[1.12] tracking-normal text-[#222222] dark:text-slate-100">
            Экраны, виджеты и операции всегда под рукой для точных и привычных сценариев
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full overflow-hidden bg-[rgb(var(--bg))]" style={rootViewportStyle}>
      <Link
        href="/assistant/"
        prefetch={false}
        className="absolute right-4 top-4 z-30 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur"
        aria-label="Закрыть онбординг"
        onClick={markPwaPromptReadyAfterOnboarding}
      >
        <X className="h-5 w-5" />
      </Link>
      {showBack ? (
        <Link
          href={backHref}
          className="absolute left-4 top-4 z-30 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur"
          aria-label="Назад"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      ) : null}

      <div
        ref={viewportRef}
        className="relative z-0 w-full"
        style={{ touchAction: "pan-y", height: "100%", minHeight: "100%" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ width: `${onboardingSlides.length * 100}%`, transform: `translateX(-${activeSlide * (100 / onboardingSlides.length)}%)` }}
        >
          {onboardingSlides.map((slide, index) => (
            <div key={slide} className="relative h-full" style={{ width: `${100 / onboardingSlides.length}%` }}>
              {index === 0 ? (
                <div className="relative h-full w-full">
                  <div
                    className="absolute inset-0 overflow-hidden bg-white dark:bg-slate-900"
                    style={{
                      left: `${imageFrame.x}px`,
                      top: `${imageFrame.y}px`,
                      width: `${imageFrame.width}px`,
                      height: `${imageFrame.height}px`
                    }}
                  >

                    <div className="absolute left-1/2 top-[30%] w-[92%] -translate-x-1/2 px-1 text-center">
                      <div className="flex flex-col items-center gap-2.5">
                        <div className="flex items-center justify-center gap-1 text-[17px] font-medium leading-none tracking-[-0.01em]">
                          <span className="text-[#555555] dark:text-slate-300">Билайн</span>
                          <span className="inline-flex h-[18px] w-[18px] shrink-0 translate-y-[0.5px] items-center justify-center overflow-hidden rounded-full bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="/mockups/Шар.png"
                              alt=""
                              className="h-full w-full object-contain mix-blend-multiply"
                              width={18}
                              height={18}
                              draggable={false}
                            />
                          </span>
                          <span className="text-[#000000] dark:text-slate-100">One</span>
                        </div>
                        <div className="whitespace-nowrap text-[24px] font-bold leading-[1.15] tracking-[-0.03em] text-[#222222] dark:text-slate-100">
                          Ваш бизнес ассистент
                        </div>
                        <div className="text-[13px] font-normal leading-normal text-[#555555] dark:text-slate-300">Стоит только спросить</div>
                      </div>
                    </div>

                    <div className="absolute left-1/2 top-[48%] w-[84%] -translate-x-1/2 rounded-full border border-[#e4e6ec] bg-[#eff0f3] px-[12px] py-[9px] dark:border-slate-700 dark:bg-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex min-w-0 items-center whitespace-nowrap text-[11px] font-normal leading-[1.1] text-[#9ca0aa] dark:text-slate-400">
                          <span className="max-w-full overflow-hidden text-ellipsis tracking-[-0.01em]">{animatedText || " "}</span>
                          <span
                            className="ml-[2px] inline-block h-[0.95em] w-[1px] bg-[#9ca0aa] align-middle"
                            style={{ animation: "onboardingCaretBlink 0.8s steps(1, end) infinite" }}
                          />
                        </span>
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-yellow text-accent-dark shadow-softSm">
                          <SendHorizonal className="h-5 w-5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                renderGeneratedSlide(index)
              )}
            </div>
          ))}
        </div>
      </div>
      {renderBottomNav()}

      <style jsx>{`
        @keyframes onboardingCaretBlink {
          0%,
          45% {
            opacity: 1;
          }
          46%,
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
