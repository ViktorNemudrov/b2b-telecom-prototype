"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, FileText, Settings } from "lucide-react";
import { RecordingPlayer } from "@shared/components/RecordingPlayer";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { getCallById } from "@shared/lib/mockData";
import { markMissedCallsSeen } from "@shared/lib/runtimeFlags";
import { goSmartBack } from "@shared/lib/smartBack";

export function CallDetailClient({
  id,
  backHref = "/communication"
}: {
  id: string;
  /** Куда вести «Назад» (AI: /assistant, Classic: /communication). */
  backHref?: string;
}) {
  const router = useRouter();
  const call = id ? getCallById(id) : undefined;
  const [showTranscript, setShowTranscript] = React.useState(false);

  React.useEffect(() => {
    markMissedCallsSeen();
  }, []);

  if (!call) {
    return (
      <div className="safe-px mx-auto min-h-dvh max-w-[430px] pb-8 pt-4">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
          onClick={() => goSmartBack(router, backHref)}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100">
            <ChevronLeft className="h-4 w-4" />
          </span>
          Назад
        </button>
        <p className="mt-8 text-center text-sm text-slate-500">Звонок не найден (демо).</p>
      </div>
    );
  }

  const title = (call.title || call.summary.split(".")[0])?.trim() || "Звонок";
  const bullets =
    call.talkBullets ??
    call.summary.split(/[.!?]\s+/).filter(Boolean).slice(0, 4).map((s) => s.trim());

  return (
    <div className="safe-px mx-auto min-h-dvh max-w-[430px] pb-8 pt-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 text-sm font-semibold text-slate-800 shadow-softSm transition hover:bg-slate-50"
          onClick={() => goSmartBack(router, backHref)}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100">
            <ChevronLeft className="h-4 w-4" />
          </span>
          Назад
        </button>
        <button
          type="button"
          onClick={() => openDevelopmentStub("Настройки записи звонка.")}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-softSm transition hover:bg-slate-50"
          aria-label="Настройки"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4">
        <h1 className="text-xl font-semibold leading-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{call.phone}</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent-dark px-3 py-1.5 text-xs font-semibold text-white">
          <span className="opacity-90">{call.missed ? "Пропущенный" : "Входящий"}</span>
          <span className="text-white/70">·</span>
          <span>Филатов</span>
        </div>
      </div>

      {call.recordingUrl ? (
        <div className="mt-4">
          <RecordingPlayer src={call.recordingUrl} fileName={`${call.id}.wav`} layout="bar" centerLabel="Запись звонка" />
        </div>
      ) : null}

      <Card className="mt-4">
        <CardContent className="pb-5 pt-5">
          <div className="text-base font-semibold text-slate-900">
            Итоги разговора <span className="text-accent-yellow">⭐</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Ключевые моменты разговора и запросы клиента</p>
          <ul className="mt-4 list-disc space-y-2 pl-4 text-sm text-slate-800">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setShowTranscript((v) => !v)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E8D5F5] via-[#C4B5FD] to-[#7E6DBF] px-4 py-3 text-sm font-semibold text-slate-900 shadow-softSm transition hover:opacity-95 active:translate-y-[1px]"
          >
            <FileText className="h-4 w-4" />
            Расшифровка
          </button>
          {showTranscript ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm whitespace-pre-wrap text-slate-800">
              {call.transcript}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="pb-4 pt-4">
          <p className="text-sm text-slate-600">срок хранения 60 дней — осталось 43 дня</p>
          <Button
            variant="secondary"
            className="mt-3 w-full rounded-full"
            onClick={() => openDevelopmentStub("Продление срока хранения записи.")}
          >
            Увеличить срок хранения
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
