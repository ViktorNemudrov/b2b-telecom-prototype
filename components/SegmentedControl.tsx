"use client";

import * as React from "react";
import { cn } from "@/components/ui/cn";
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
    <div className="relative flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-softSm">
      <motion.div
        className="absolute inset-y-1 rounded-xl bg-slate-900/[0.04]"
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
              active ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

