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
    <Card className="mt-3 overflow-hidden">
      <CardContent className="pb-4 pt-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EFEAFF]">
            <Sparkles className="h-5 w-5 text-accent-violet" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            {subtitle ? <div className="mt-1 text-xs text-slate-500">{subtitle}</div> : null}
          </div>
        </div>

        <div className="mt-4">
          <Button className="w-full rounded-full" onClick={onCta}>
            {ctaLabel} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

