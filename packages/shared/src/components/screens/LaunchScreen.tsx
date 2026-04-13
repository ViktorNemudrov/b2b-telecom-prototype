"use client";

const splashSrc = "/mockups/888.jpg";

/**
 * Экран запуска по макету 888.jpg (шар, бейджи, слоган — в составе арта).
 * Нативный img + крупный intrinsic size — меньше размытия при масштабе, чем у сжатого превью.
 */
export function LaunchScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[rgb(var(--bg))] px-4">
      <div className="launch-sphere-pulse will-change-transform">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={splashSrc}
          alt=""
          width={1125}
          height={1800}
          decoding="async"
          fetchPriority="high"
          className="h-auto w-full max-w-[min(100%,430px)] object-contain [image-rendering:auto]"
        />
      </div>
    </div>
  );
}
