"use client";

import { useSearchParams } from "next/navigation";
import { PageBackLink } from "@shared/components/PageBackLink";
import { APPEALS_FROM_QUERY, resolveAppealsBackFallback } from "@shared/lib/appealsBackFallback";

/** Кнопка «Назад» на `/appeals/`: goSmartBack + fallback из query `from`. */
export function AppealsBackLink() {
  const searchParams = useSearchParams();
  const from = searchParams.get(APPEALS_FROM_QUERY);
  return <PageBackLink href={resolveAppealsBackFallback(from)} />;
}
