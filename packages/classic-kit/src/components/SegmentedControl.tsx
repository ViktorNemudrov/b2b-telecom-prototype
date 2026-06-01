"use client";

import * as React from "react";
import { cn } from "@shared/components/ui/cn";
import { motion } from "framer-motion";

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange
}: {
  value: T;
  options: { key: T; label: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <div className="relative flex items-center rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] p-1">
      <motion.div
        className="absolute inset-y-1 rounded-xl bg-accent-orange"
        layout
        transition={{ type: "spring", stiffness: 500, damping: 40 }}
        style={{
          width: `${100 / options.length}%`,
          left: `${(options.findIndex((o) => o.key === value) * 100) / options.length}%`
        }}
      />
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={cn(
              "relative z-10 h-9 flex-1 rounded-xl px-3 text-xs font-semibold transition",
              active ? "text-white" : "text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

