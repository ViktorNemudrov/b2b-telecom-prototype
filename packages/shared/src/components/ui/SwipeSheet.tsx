"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import * as React from "react";
import { cn } from "@shared/components/ui/cn";

function shouldDismissBySwipe(info: PanInfo) {
  return info.offset.y > 72 || info.velocity.y > 420;
}

export function SwipeSheet({
  open,
  onClose,
  children,
  className,
  innerClassName,
  backdropClassName,
  backdropDismiss = true,
  closeOnEscape = true
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  backdropClassName?: string;
  /** Если false — закрытие только свайпом / кнопками внутри, не по тапу на фон. */
  backdropDismiss?: boolean;
  closeOnEscape?: boolean;
}) {
  React.useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, closeOnEscape]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={cn("fixed inset-0 z-[100]", className)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {backdropDismiss ? (
            <motion.button
              type="button"
              aria-label="Закрыть"
              className={cn("absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]", backdropClassName)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
          ) : (
            <motion.div
              aria-hidden
              className={cn("pointer-events-none absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]", backdropClassName)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              "absolute bottom-0 left-0 right-0 mx-auto w-full max-w-[430px] rounded-t-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-600 dark:bg-slate-900",
              innerClassName
            )}
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "110%", opacity: 0.95 }}
            transition={{ type: "spring", damping: 30, stiffness: 360 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 320 }}
            dragElastic={{ top: 0, bottom: 0.22 }}
            onDragEnd={(_, info) => {
              if (shouldDismissBySwipe(info)) onClose();
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function SwipeSheetHandle() {
  return (
    <div className="flex justify-center pt-2 pb-1" aria-hidden>
      <div className="h-1 w-10 rounded-full bg-slate-300/90 dark:bg-slate-600/90" />
    </div>
  );
}
