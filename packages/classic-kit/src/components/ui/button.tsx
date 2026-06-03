"use client";

import * as React from "react";
import { cn } from "@shared/components/ui/cn";

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
          "bg-accent-orange text-white shadow-softSm hover:brightness-95",
        variant === "secondary" &&
          "bg-[rgb(var(--card))] text-[rgb(var(--text))] shadow-softSm hover:brightness-110 dark:bg-[rgb(var(--card))] dark:text-[rgb(var(--text))]",
        variant === "outline" &&
          "border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--text))] hover:brightness-110 dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--card))] dark:text-[rgb(var(--text))]",
        variant === "ghost" && "bg-transparent text-[rgb(var(--muted))] hover:bg-[rgb(var(--surface2))] hover:text-[rgb(var(--text))] dark:text-[rgb(var(--muted))] dark:hover:bg-[rgb(var(--surface2))] dark:hover:text-[rgb(var(--text))]",
        className
      )}
      {...props}
    />
  );
}

