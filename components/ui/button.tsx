"use client";

import * as React from "react";
import { cn } from "@/components/ui/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "icon";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition",
        "active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-50",
        size === "md" && "h-11 px-4",
        size === "sm" && "h-9 px-3",
        size === "icon" && "h-11 w-11 px-0",
        variant === "primary" &&
          "bg-gradient-to-r from-accent-teal to-accent-violet text-white shadow-softSm hover:opacity-95",
        variant === "secondary" && "bg-white text-slate-900 shadow-softSm hover:bg-slate-50",
        variant === "outline" && "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
        variant === "ghost" && "bg-transparent text-slate-800 hover:bg-slate-100",
        className
      )}
      {...props}
    />
  );
}

