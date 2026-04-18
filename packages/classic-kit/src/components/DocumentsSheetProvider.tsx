"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ClassicDocumentsScreen } from "@shared/components/screens/ClassicDocumentsScreen";

type DocumentsSheetContextValue = {
  open: boolean;
  openDocumentsSheet: () => void;
  closeDocumentsSheet: () => void;
  toggleDocumentsSheet: () => void;
};

const DocumentsSheetContext = React.createContext<DocumentsSheetContextValue | null>(null);

export function useDocumentsSheet(): DocumentsSheetContextValue {
  const ctx = React.useContext(DocumentsSheetContext);
  if (!ctx) {
    throw new Error("useDocumentsSheet must be used within DocumentsSheetProvider");
  }
  return ctx;
}

const CLOSE_DRAG_PX = 96;
const ANIM_MS = 320;

function useHideDistance(): number {
  const [d, setD] = React.useState(800);
  React.useEffect(() => {
    const measure = () => setD(Math.min(window.innerHeight, 960));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return d;
}

function DocumentsBottomSheet({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const hideDistance = useHideDistance();
  const [mounted, setMounted] = React.useState(false);
  const [baseY, setBaseY] = React.useState(hideDistance);
  const [dragOffset, setDragOffset] = React.useState(0);
  const dragOffsetRef = React.useRef(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartY = React.useRef<number | null>(null);

  React.useEffect(() => {
    dragOffsetRef.current = dragOffset;
  }, [dragOffset]);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => setMounted(true), []);

  const runAfterCloseAnim = React.useCallback(
    (cb: () => void) => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      closeTimer.current = setTimeout(cb, ANIM_MS);
    },
    []
  );

  React.useEffect(() => {
    if (open) {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      setBaseY(hideDistance);
      setDragOffset(0);
      const id = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setBaseY(0));
      });
      return () => window.cancelAnimationFrame(id);
    }
    setBaseY(hideDistance);
    setDragOffset(0);
  }, [open, hideDistance]);

  const totalY = baseY + dragOffset;

  const closeWithAnimation = React.useCallback(() => {
    setBaseY(hideDistance);
    setDragOffset(0);
    runAfterCloseAnim(() => onClose());
  }, [hideDistance, onClose, runAfterCloseAnim]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    const dy = e.clientY - dragStartY.current;
    setDragOffset(Math.max(0, dy));
  };

  const endDrag = () => {
    setIsDragging(false);
    dragStartY.current = null;
    const d = dragOffsetRef.current;
    if (d > CLOSE_DRAG_PX) {
      setBaseY(hideDistance);
      setDragOffset(0);
      runAfterCloseAnim(() => onClose());
    } else {
      setDragOffset(0);
    }
  };

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeWithAnimation();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeWithAnimation]);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  React.useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  if (!mounted || typeof document === "undefined" || !open) return null;

  const sheet = (
    <div
      className="pointer-events-auto fixed inset-0 z-[80] flex flex-col justify-end opacity-100 transition-opacity duration-200"
      aria-hidden={false}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 dark:bg-black/55"
        aria-label="Закрыть документы"
        onClick={() => closeWithAnimation()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Документы"
        data-testid="classic-documents-sheet"
        className="relative z-[81] mx-auto flex max-h-[min(92dvh,820px)] w-full max-w-[430px] flex-col rounded-t-[22px] bg-[#f2f4f8] shadow-[0_-12px_48px_rgba(15,23,42,0.18)] dark:bg-slate-900 dark:shadow-[0_-12px_48px_rgba(0,0,0,0.45)]"
        style={{
          transform: `translateY(${totalY}px)`,
          transition: isDragging ? "none" : `transform ${ANIM_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`
        }}
      >
        <div
          className="flex shrink-0 cursor-grab touch-none flex-col items-center pt-3 pb-2 active:cursor-grabbing"
          style={{ touchAction: "none" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <span className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden />
          <span className="sr-only">Потяните вниз, чтобы закрыть</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-1">
          <ClassicDocumentsScreen />
        </div>
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
}

export function DocumentsSheetProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = React.useState(false);

  const closeDocumentsSheet = React.useCallback(() => setOpen(false), []);
  const openDocumentsSheet = React.useCallback(() => setOpen(true), []);
  const toggleDocumentsSheet = React.useCallback(() => setOpen((v) => !v), []);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const value = React.useMemo(
    () => ({
      open,
      openDocumentsSheet,
      closeDocumentsSheet,
      toggleDocumentsSheet
    }),
    [open, openDocumentsSheet, closeDocumentsSheet, toggleDocumentsSheet]
  );

  return (
    <DocumentsSheetContext.Provider value={value}>
      {children}
      <DocumentsBottomSheet open={open} onClose={closeDocumentsSheet} />
    </DocumentsSheetContext.Provider>
  );
}
