"use client";

import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { cn } from "@shared/components/ui/cn";
import { useOverlayNativeBack } from "@shared/lib/nativeBackOverlayStack";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  contentClassName
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useOverlayNativeBack(open, onClose);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            aria-label="Закрыть"
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              "absolute bottom-0 left-0 right-0 mx-auto w-full max-w-[430px] rounded-t-3xl border border-slate-200 bg-white shadow-soft",
              "dark:border-slate-700 dark:bg-slate-900",
              className
            )}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {title ? (
              <div className="safe-px flex items-center justify-between gap-3 border-b border-slate-100 py-4 dark:border-slate-700">
                <div className="text-base font-semibold dark:text-slate-100">{title}</div>
                <button
                  className="rounded-xl px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                  onClick={onClose}
                >
                  Закрыть
                </button>
              </div>
            ) : null}
            <div className={cn("safe-px pb-6 pt-4", contentClassName)}>{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

