"use client";

import * as React from "react";
import { cn } from "@shared/components/ui/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
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
        "inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition",
        "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        size === "md" && "h-11 px-5",
        size === "sm" && "h-9 px-3.5",
        size === "icon" && "h-10 w-10 px-0",
        variant === "primary" &&
          "bg-accent-orange text-white shadow-softSm hover:brightness-105",
        variant === "secondary" &&
          "bg-[rgb(var(--surface-2))] text-[rgb(var(--text))] shadow-softSm hover:brightness-105 dark:bg-[rgb(var(--surface-2))]",
        variant === "outline" &&
          "border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--text))] hover:brightness-105 dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--card))]",
        variant === "ghost" &&
          "bg-transparent text-[rgb(var(--muted))] hover:bg-[rgb(var(--surface-2))] hover:text-[rgb(var(--text))]",
        variant === "danger" &&
          "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 dark:bg-rose-500/15 dark:hover:bg-rose-500/25",
        className
      )}
      {...props}
    />
  );
}
