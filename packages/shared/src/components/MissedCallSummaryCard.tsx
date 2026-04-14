"use client";

import Link from "next/link";
import { PhoneOff } from "lucide-react";

/** Карточка последнего пропущенного по макету 877.png */
export function MissedCallSummaryCard({
  title = "Доставка офисной техники",
  subtitle = "Пропущенный",
  time = "12:42",
  missedBadge = "x2",
  href = "/missed-calls/"
}: {
  title?: string;
  subtitle?: string;
  time?: string;
  missedBadge?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-[22px] border border-[#E8EAED] bg-white p-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition hover:brightness-[1.01] active:scale-[0.99] dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="relative shrink-0">
        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#FFE7E7] dark:bg-rose-900/40">
          <PhoneOff className="h-[26px] w-[26px] text-[#E53935]" strokeWidth={2} />
        </div>
        <span className="absolute -right-1 -top-1 flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#E53935] px-1 text-[10px] font-bold leading-none text-white">
          {missedBadge}
        </span>
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="text-[15px] font-semibold leading-snug tracking-tight text-[#212529] dark:text-slate-100">
          {title}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[13px] text-[#8E8E93]">
          <span>{subtitle}</span>
        </div>
      </div>
      <div className="shrink-0 pt-0.5 text-[13px] tabular-nums text-[#C7C7CC]">{time}</div>
    </Link>
  );
}
