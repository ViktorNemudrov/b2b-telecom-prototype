"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDocumentsSheet } from "@shared/components/DocumentsSheetProvider";
import {
  CLASSIC_NAV_SWIPE_SEGMENTS,
  classicAssistantNavSwipeIndex,
  hrefForClassicNavSegment
} from "@shared/components/classicAssistantNavSwipeHelpers";

export {
  CLASSIC_NAV_SWIPE_SEGMENTS,
  classicAssistantNavSwipeIndex,
  normalizeClassicNavPath
} from "@shared/components/classicAssistantNavSwipeHelpers";

const SWIPE_MIN_PX = 56;
const HORIZONTAL_DOMINATES = 1.2;

function swipeTargetFromWindowPath(): number | null {
  if (typeof window === "undefined") return null;
  return classicAssistantNavSwipeIndex(window.location.pathname || "/");
}

function shouldIgnoreSwipeTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return true;
  if (target.closest("[data-no-assistant-nav-swipe]")) return true;
  const el = target.closest("input, textarea, select");
  if (el) return true;
  if ((target as HTMLElement).isContentEditable) return true;
  return false;
}

/**
 * Горизонтальный свайп между основными вкладками шапки Classic (Фид / Главный / Виджеты).
 * При отпускании использует `window.location.pathname`, чтобы индекс вкладки был верен уже при первом заходе (cold start).
 */
export function ClassicAssistantNavSwipeContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { open: documentsSheetOpen } = useDocumentsSheet();

  const trackingRef = React.useRef<
    | { phase: "idle" }
    | {
        phase: "active";
        pointerId: number;
        startX: number;
        startY: number;
      }
  >({ phase: "idle" });

  const navSwipeActive = classicAssistantNavSwipeIndex(pathname) !== null;

  React.useEffect(() => {
    if (classicAssistantNavSwipeIndex(pathname) === null) return;
    const prefetchNeighbors = () => {
      const idx = swipeTargetFromWindowPath();
      if (idx === null) return;
      if (idx > 0) router.prefetch(hrefForClassicNavSegment(idx - 1));
      if (idx < CLASSIC_NAV_SWIPE_SEGMENTS.length - 1)
        router.prefetch(hrefForClassicNavSegment(idx + 1));
    };
    prefetchNeighbors();
    const raf = window.requestAnimationFrame(prefetchNeighbors);
    const t = window.setTimeout(prefetchNeighbors, 0);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [pathname, router]);

  const flushNav = React.useCallback(
    (deltaX: number, deltaY: number) => {
      if (documentsSheetOpen) return;
      if (Math.abs(deltaX) < SWIPE_MIN_PX) return;
      if (Math.abs(deltaX) < Math.abs(deltaY) * HORIZONTAL_DOMINATES) return;

      const idx = swipeTargetFromWindowPath();
      if (idx === null) return;

      const goLeftContent = deltaX < 0;
      if (goLeftContent && idx < CLASSIC_NAV_SWIPE_SEGMENTS.length - 1) {
        router.push(hrefForClassicNavSegment(idx + 1));
      } else if (!goLeftContent && idx > 0) {
        router.push(hrefForClassicNavSegment(idx - 1));
      }
    },
    [documentsSheetOpen, router]
  );

  const onPointerDownCapture = React.useCallback(
    (e: React.PointerEvent) => {
      if (!navSwipeActive) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (shouldIgnoreSwipeTarget(e.target)) return;
      trackingRef.current = {
        phase: "active",
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY
      };
    },
    [navSwipeActive]
  );

  const endTracking = React.useCallback(
    (e: React.PointerEvent) => {
      const t = trackingRef.current;
      if (t.phase !== "active" || t.pointerId !== e.pointerId) return;
      trackingRef.current = { phase: "idle" };
      const dx = e.clientX - t.startX;
      const dy = e.clientY - t.startY;
      flushNav(dx, dy);
    },
    [flushNav]
  );

  const onPointerCancelCapture = React.useCallback((e: React.PointerEvent) => {
    const t = trackingRef.current;
    if (t.phase === "active" && t.pointerId === e.pointerId) {
      trackingRef.current = { phase: "idle" };
    }
  }, []);

  return (
    <div
      className="min-h-dvh"
      data-testid={navSwipeActive ? "classic-assistant-nav-swipe-root" : undefined}
      onPointerDownCapture={navSwipeActive ? onPointerDownCapture : undefined}
      onPointerUpCapture={navSwipeActive ? endTracking : undefined}
      onPointerCancelCapture={navSwipeActive ? onPointerCancelCapture : undefined}
    >
      {children}
    </div>
  );
}
