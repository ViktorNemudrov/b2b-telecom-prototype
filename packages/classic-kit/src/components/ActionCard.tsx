"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";

export function ActionCard({
  title,
  subtitle,
  ctaLabel,
  onCta
}: {
  title: string;
  subtitle?: string;
  ctaLabel: string;
  onCta: () => void;
}) {
  return (
    <Card className="mt-3 overflow-hidden border-slate-200 dark:border-slate-700">
      <CardContent className="pb-4 pt-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EFEAFF] dark:bg-violet-950/60">
            <Sparkles className="h-5 w-5 text-accent-violet dark:text-violet-300" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</div>
            {subtitle ? (
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</div>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          <Button
            className="w-full rounded-full bg-accent-dark text-white hover:bg-accent-dark/90 dark:bg-accent-yellow dark:text-slate-900 dark:hover:bg-accent-yellow/90"
            onClick={onCta}
          >
            {ctaLabel} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
