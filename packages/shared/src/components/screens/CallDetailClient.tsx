"use client";

import * as React from "react";
import { FileText, Settings } from "lucide-react";
import { RecordingPlayer } from "@shared/components/RecordingPlayer";
import { PageBackLink } from "@shared/components/PageBackLink";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { getCallById } from "@shared/lib/mockData";
import { markMissedCallsSeen } from "@shared/lib/runtimeFlags";
import { getCustomizationButtonClasses, useUiCustomization } from "@shared/lib/uiCustomization";

export function CallDetailClient({
  id,
  backHref = "/communication"
}: {
  id: string;
  /** Куда вести «Назад» (AI: /assistant, Classic: /communication). */
  backHref?: string;
}) {
  const call = id ? getCallById(id) : undefined;
  const [showTranscript, setShowTranscript] = React.useState(false);
  const settingsCustom = useUiCustomization("calldetail.settings");
  const transcriptCustom = useUiCustomization("calldetail.transcript");
  const storageCustom = useUiCustomization("calldetail.storage");

  React.useEffect(() => {
    markMissedCallsSeen();
  }, []);

  if (!call) {
    return (
      <div className="safe-px mx-auto min-h-dvh max-w-[430px] pb-8 pt-4">
        <PageBackLink href={backHref} />
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
        <PageBackLink href={backHref} />
        <button
          type="button"
          onClick={() =>
            openDevelopmentStub(
              settingsCustom.useMock ? "Настройки записи звонка (мок из кастомизации)." : "Настройки записи звонка."
            )
          }
          className={[
            "flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-softSm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
            getCustomizationButtonClasses(settingsCustom.dimmedDisabled)
          ].join(" ")}
          aria-label="Настройки"
          disabled={settingsCustom.dimmedDisabled}
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4">
        <h1 className="text-xl font-semibold leading-tight text-slate-900 dark:text-slate-100">{title}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{call.phone}</p>
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
          <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Итоги разговора <span className="text-accent-yellow">⭐</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Ключевые моменты разговора и запросы клиента</p>
          <ul className="mt-4 list-disc space-y-2 pl-4 text-sm text-slate-800 dark:text-slate-200">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              if (transcriptCustom.dimmedDisabled) return;
              if (transcriptCustom.useMock) {
                openDevelopmentStub("Расшифровка звонка (мок из кастомизации).");
                return;
              }
              setShowTranscript((v) => !v);
            }}
            className={[
              "mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E8D5F5] via-[#C4B5FD] to-[#7E6DBF] px-4 py-3 text-sm font-semibold text-slate-900 shadow-softSm transition hover:opacity-95 active:translate-y-[1px]",
              getCustomizationButtonClasses(transcriptCustom.dimmedDisabled)
            ].join(" ")}
            disabled={transcriptCustom.dimmedDisabled}
          >
            <FileText className="h-4 w-4" />
            Расшифровка
          </button>
          {showTranscript ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm whitespace-pre-wrap text-slate-800 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-100">
              {call.transcript}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="pb-4 pt-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">срок хранения 60 дней — осталось 43 дня</p>
          <Button
            variant="secondary"
            className="mt-3 w-full rounded-full"
            onClick={() =>
              openDevelopmentStub(
                storageCustom.useMock ? "Продление срока хранения записи (мок из кастомизации)." : "Продление срока хранения записи."
              )
            }
            disabled={storageCustom.dimmedDisabled}
          >
            Увеличить срок хранения
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
