"use client";

import * as React from "react";
import { cn } from "@shared/components/ui/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none",
        "placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-accent-yellow/40",
        className
      )}
      {...props}
    />
  );
});

