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

const SWIPE_MIN_PX = 52;
const SWIPE_MIN_PX_TOUCH = 36;
const HORIZONTAL_DOMINATES = 1.05;
const NAV_DEBOUNCE_MS = 380;

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
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const lastNavAtRef = React.useRef(0);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

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
    (deltaX: number, deltaY: number, pointerType: string) => {
      if (documentsSheetOpen) return;
      const minPx = pointerType === "touch" ? SWIPE_MIN_PX_TOUCH : SWIPE_MIN_PX;
      if (Math.abs(deltaX) < minPx) return;
      if (Math.abs(deltaX) < Math.abs(deltaY) * HORIZONTAL_DOMINATES) return;

      const idx = swipeTargetFromWindowPath();
      if (idx === null) return;

      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (now - lastNavAtRef.current < NAV_DEBOUNCE_MS) return;

      const goLeftContent = deltaX < 0;
      if (goLeftContent && idx < CLASSIC_NAV_SWIPE_SEGMENTS.length - 1) {
        router.push(hrefForClassicNavSegment(idx + 1));
        lastNavAtRef.current = now;
      } else if (!goLeftContent && idx > 0) {
        router.push(hrefForClassicNavSegment(idx - 1));
        lastNavAtRef.current = now;
      }
    },
    [documentsSheetOpen, router]
  );

  const pointerTypeRef = React.useRef<string>("mouse");

  const onPointerDownCapture = React.useCallback(
    (e: React.PointerEvent) => {
      if (!navSwipeActive) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (shouldIgnoreSwipeTarget(e.target)) return;
      pointerTypeRef.current = e.pointerType;
      trackingRef.current = {
        phase: "active",
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY
      };
      if (e.pointerType === "touch" && rootRef.current) {
        try {
          rootRef.current.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
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
      flushNav(dx, dy, pointerTypeRef.current);
    },
    [flushNav]
  );

  const onPointerCancelCapture = React.useCallback((e: React.PointerEvent) => {
    const t = trackingRef.current;
    if (t.phase === "active" && t.pointerId === e.pointerId) {
      trackingRef.current = { phase: "idle" };
    }
  }, []);

  const onLostPointerCapture = React.useCallback(() => {
    trackingRef.current = { phase: "idle" };
  }, []);

  const onTouchStartCapture = React.useCallback(
    (e: React.TouchEvent) => {
      if (!navSwipeActive) return;
      if (shouldIgnoreSwipeTarget(e.target)) return;
      const t = e.touches[0];
      if (!t) return;
      touchStartRef.current = { x: t.clientX, y: t.clientY };
    },
    [navSwipeActive]
  );

  const onTouchEndCapture = React.useCallback(
    (e: React.TouchEvent) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      if (!navSwipeActive || !start) return;
      const t = e.changedTouches[0];
      flushNav(t.clientX - start.x, t.clientY - start.y, "touch");
    },
    [flushNav, navSwipeActive]
  );

  const onTouchCancelCapture = React.useCallback(() => {
    touchStartRef.current = null;
  }, []);

  return (
    <div
      ref={rootRef}
      className="min-h-dvh"
      style={
        navSwipeActive
          ? ({ overscrollBehaviorX: "contain", touchAction: "pan-x pan-y" } as React.CSSProperties)
          : undefined
      }
      data-testid={navSwipeActive ? "classic-assistant-nav-swipe-root" : undefined}
      onPointerDownCapture={navSwipeActive ? onPointerDownCapture : undefined}
      onPointerUpCapture={navSwipeActive ? endTracking : undefined}
      onPointerCancelCapture={navSwipeActive ? onPointerCancelCapture : undefined}
      onLostPointerCapture={navSwipeActive ? onLostPointerCapture : undefined}
      onTouchStartCapture={navSwipeActive ? onTouchStartCapture : undefined}
      onTouchEndCapture={navSwipeActive ? onTouchEndCapture : undefined}
      onTouchCancelCapture={navSwipeActive ? onTouchCancelCapture : undefined}
    >
      {children}
    </div>
  );
}
