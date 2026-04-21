"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, X, SendHorizonal } from "lucide-react";

const onboardingSlides = [
  ["generated-onboarding-1"],
  ["/mockups/onboarding-2.jpg", "/mockups/2 экран онбординга.jpg"],
  ["/mockups/onboarding-3.jpg", "/mockups/3 экран онбординга.jpg"],
  ["/mockups/onboarding-4.jpg", "/mockups/4 экран онбординга.jpg"]
];
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
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [slideSourceIndexes, setSlideSourceIndexes] = React.useState<number[]>(() => onboardingSlides.map(() => 0));
  const [slideBroken, setSlideBroken] = React.useState<boolean[]>(() => onboardingSlides.map(() => false));
  const [viewportSize, setViewportSize] = React.useState({ width: 390, height: 844 });
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const touchCurrentRef = React.useRef<{ x: number; y: number } | null>(null);
  const animatedText = useAnimatedPrompt();
  const sourceAspect = 591 / 1280;

  React.useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const updateSize = () => {
      setViewportSize({ width: node.clientWidth, height: node.clientHeight });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const imageFrame = React.useMemo(() => {
    const { width, height } = viewportSize;
    if (!width || !height) return { x: 0, y: 0, width, height };
    const viewportAspect = width / height;
    if (viewportAspect > sourceAspect) {
      const renderedWidth = height * sourceAspect;
      return { x: (width - renderedWidth) / 2, y: 0, width: renderedWidth, height };
    }
    const renderedHeight = width / sourceAspect;
    return { x: 0, y: (height - renderedHeight) / 2, width, height: renderedHeight };
  }, [viewportSize]);

  React.useEffect(() => {
    if (activeSlide !== onboardingSlides.length - 1) {
      return;
    }

    const timeout = window.setTimeout(() => {
      window.location.assign("/assistant/");
    }, 1100);

    return () => window.clearTimeout(timeout);
  }, [activeSlide]);

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

    if (deltaX < 0 && activeSlide < onboardingSlides.length - 1) {
      setActiveSlide((prev) => prev + 1);
    }
    if (deltaX > 0 && activeSlide > 0) {
      setActiveSlide((prev) => prev - 1);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#11131a]">
      <Link
        href="/assistant/"
        prefetch={false}
        className="absolute right-4 top-4 z-30 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur"
        aria-label="Закрыть онбординг"
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
        className="relative z-0 h-screen w-full"
        style={{ touchAction: "pan-y" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ width: `${onboardingSlides.length * 100}%`, transform: `translateX(-${activeSlide * (100 / onboardingSlides.length)}%)` }}
        >
          {onboardingSlides.map((slide, index) => (
            <div key={slide[0]} className="relative h-full" style={{ width: `${100 / onboardingSlides.length}%` }}>
              {index === 0 ? (
                <div className="relative h-full w-full">
                  <div
                    className="absolute overflow-hidden rounded-[44px] bg-[#f3f3f6]"
                    style={{
                      left: `${imageFrame.x}px`,
                      top: `${imageFrame.y}px`,
                      width: `${imageFrame.width}px`,
                      height: `${imageFrame.height}px`
                    }}
                  >
                    <div className="absolute left-[8.5%] top-[3.3%] text-[13px] font-semibold text-[#121723]">9:41</div>
                    <div className="absolute right-[8%] top-[3.2%] flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#121723]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#121723]" />
                      <span className="h-2.5 w-5 rounded-full bg-[#121723]" />
                    </div>

                    <div className="absolute left-1/2 top-[38.6%] -translate-x-1/2 text-center">
                      <div className="text-[18px] font-semibold leading-none text-[#303342]">Билайн🟡One</div>
                      <div className="mt-2.5 whitespace-nowrap text-[22px] font-semibold leading-none tracking-[-0.02em] text-[#2f3241]">
                        Ваш бизнес ассистент
                      </div>
                      <div className="mt-2.5 text-[12px] leading-none text-[#2f3241]">Стоит только спросить</div>
                    </div>

                    <div className="absolute left-1/2 top-[47.05%] w-[84%] -translate-x-1/2 rounded-full border border-[#e4e6ec] bg-[#eff0f3] px-[12px] py-[9px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex min-w-0 items-center whitespace-nowrap text-[11px] font-normal leading-[1.1] text-[#9ca0aa]">
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
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide[slideSourceIndexes[index]]}
                    alt={`Экран онбординга ${index + 1}`}
                    className="h-full w-full object-contain"
                    draggable={false}
                    onError={() => {
                      const hasNextSource = slideSourceIndexes[index] + 1 < slide.length;
                      if (hasNextSource) {
                        setSlideSourceIndexes((prev) => {
                          const next = [...prev];
                          next[index] = prev[index] + 1;
                          return next;
                        });
                        return;
                      }
                      setSlideBroken((prev) => {
                        const next = [...prev];
                        next[index] = true;
                        return next;
                      });
                    }}
                  />
                  {slideBroken[index] ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#11131a] p-6 text-center text-sm text-white/90">
                      Не удалось загрузить экран онбординга {index + 1}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

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

      <div
        className="absolute z-40"
        style={{
          left: `${imageFrame.x}px`,
          top: `${imageFrame.y + imageFrame.height * 0.90}px`,
          width: `${imageFrame.width}px`,
          height: `${imageFrame.height * 0.1}px`
        }}
      >
        <div className="relative h-full w-full">
          <div className="absolute inset-0 bg-[#f3f3f6]" />

          <button
            type="button"
            aria-label="Предыдущий экран"
            className="absolute left-[7%] top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#eceef3] text-[#6f7483] shadow-[0_1px_3px_rgba(0,0,0,0.05)] disabled:opacity-35"
            onClick={() => setActiveSlide((prev) => Math.max(0, prev - 1))}
            disabled={activeSlide === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2">
            {onboardingSlides.map((slide, index) => (
              <button
                type="button"
                key={`dot-${slide[0]}`}
                data-testid={`onboarding-dot-${index}`}
                aria-label={`Перейти к экрану ${index + 1}`}
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  index === activeSlide ? "bg-[#1f2230]" : "bg-[#dde0e8]"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Следующий экран"
            className="absolute right-[7%] top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#eceef3] text-[#2f3241] shadow-[0_1px_3px_rgba(0,0,0,0.05)] disabled:opacity-35"
            onClick={() => setActiveSlide((prev) => Math.min(onboardingSlides.length - 1, prev + 1))}
            disabled={activeSlide === onboardingSlides.length - 1}
          >
            <ChevronLeft className="h-5 w-5 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
