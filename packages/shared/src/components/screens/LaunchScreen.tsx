"use client";

import Image from "next/image";

const splashSrc = "/mockups/888.jpg";

/**
 * Экран запуска по макету 888.jpg (шар, бейджи, слоган — в составе арта).
 */
export function LaunchScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#F2F2F2] px-4 dark:bg-slate-950">
      <div className="launch-sphere-pulse will-change-transform">
        <Image
          src={splashSrc}
          alt=""
          width={750}
          height={1200}
          className="h-auto w-full max-w-[min(100%,400px)] object-contain"
          priority
          unoptimized
        />
      </div>
    </div>
  );
}
