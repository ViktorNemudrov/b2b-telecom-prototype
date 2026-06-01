"use client";

import type { ReactNode } from "react";
import { cn } from "@shared/components/ui/cn";
import { PageBackLink } from "@shared/components/PageBackLink";

export function CenteredPageTitleBar({
  title,
  subtitle,
  backHref,
  className,
  titleClassName,
  subtitleClassName,
  rightSlot
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  backHref?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  rightSlot?: ReactNode;
}) {
  return (
    <div className={cn("space-y-0.5", className)}>
      <div className="relative flex min-h-8 items-center justify-center">
        <PageBackLink href={backHref} className="absolute left-0 mb-0 h-8 w-8 p-0 leading-none" />
        <h1 className={cn("text-center text-lg font-semibold text-[rgb(var(--text))]", titleClassName)}>{title}</h1>
        {rightSlot ? <div className="absolute right-0">{rightSlot}</div> : null}
      </div>
      {subtitle ? (
        <p className={cn("text-center text-xs text-[rgb(var(--muted))]", subtitleClassName)}>{subtitle}</p>
      ) : null}
    </div>
  );
}
