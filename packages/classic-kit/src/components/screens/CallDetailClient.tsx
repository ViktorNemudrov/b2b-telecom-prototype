"use client";

import * as React from "react";
import { FileText, Settings } from "lucide-react";
import { CenteredPageTitleBar } from "@shared/components/CenteredPageTitleBar";
import { RecordingPlayer } from "@shared/components/RecordingPlayer";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { getCallById } from "@shared/lib/mockData";
import { markMissedCallsSeen } from "@shared/lib/runtimeFlags";
import { getCustomizationButtonClasses, useUiCustomization } from "@shared/lib/uiCustomization";

export function CallDetailClient({
  id,
  backHref = "/communication/"
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
        <CenteredPageTitleBar title="Звонок" backHref={backHref} />
        <p className="mt-8 text-center text-sm text-[rgb(var(--muted))]">Звонок не найден (демо).</p>
      </div>
    );
  }

  const title = (call.title || call.summary.split(".")[0])?.trim() || "Звонок";
  const bullets =
    call.talkBullets ??
    call.summary.split(/[.!?]\s+/).filter(Boolean).slice(0, 4).map((s) => s.trim());

  return (
    <div className="safe-px mx-auto min-h-dvh max-w-[430px] pb-8 pt-3">
      <CenteredPageTitleBar
        title="Звонок"
        backHref={backHref}
        rightSlot={
          <button
            type="button"
            onClick={() =>
              openDevelopmentStub(
                settingsCustom.useMock ? "Настройки записи звонка (мок из кастомизации)." : "Настройки записи звонка."
              )
            }
            className={[
              "flex h-8 w-8 items-center justify-center rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--muted))] shadow-softSm transition hover:brightness-105 ",
              getCustomizationButtonClasses(settingsCustom.dimmedDisabled)
            ].join(" ")}
            aria-label="Настройки"
            disabled={settingsCustom.dimmedDisabled}
          >
            <Settings className="h-4 w-4" />
          </button>
        }
      />

      <div className="mt-4">
        <h1 className="text-xl font-bold leading-tight text-[rgb(var(--text))]">{title}</h1>
        <p className="mt-1 text-sm text-[rgb(var(--muted))]">{call.phone}</p>
        <div className="mt-3 inline-flex items-center gap-2">
          <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            call.missed
              ? "bg-rose-500/15 text-rose-500"
              : "bg-accent-orange/15 text-accent-orange"
          }`}>
            {call.missed ? "Пропущенный" : "Входящий"}
          </span>
          <span className="rounded-full bg-[rgb(var(--surface-2))] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--muted))]">
            Филатов
          </span>
        </div>
      </div>

      {call.recordingUrl ? (
        <div className="mt-4">
          <RecordingPlayer src={call.recordingUrl} fileName={`${call.id}.wav`} layout="bar" centerLabel="Запись звонка" />
        </div>
      ) : null}

      <Card className="mt-4">
        <CardContent className="pb-5 pt-5">
          <div className="text-base font-bold text-[rgb(var(--text))]">
            Итоги разговора <span className="text-accent-amber">★</span>
          </div>
          <p className="mt-1 text-xs text-[rgb(var(--muted))]">Ключевые моменты разговора и запросы клиента</p>
          <ul className="mt-4 space-y-2.5 text-sm text-[rgb(var(--text))]">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-accent-orange/20 text-center text-[10px] font-bold leading-4 text-accent-orange">{i + 1}</span>
                <span>{b}</span>
              </li>
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
              "mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] px-4 py-3 text-sm font-semibold text-white shadow-softSm transition hover:opacity-90 active:scale-[0.98]",
              getCustomizationButtonClasses(transcriptCustom.dimmedDisabled)
            ].join(" ")}
            disabled={transcriptCustom.dimmedDisabled}
          >
            <FileText className="h-4 w-4" />
            {showTranscript ? "Скрыть расшифровку" : "Расшифровка"}
          </button>
          {showTranscript ? (
            <div className="mt-4 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] p-3 text-sm whitespace-pre-wrap text-[rgb(var(--text))]">
              {call.transcript}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="pb-4 pt-4">
          <p className="text-sm text-[rgb(var(--muted))]">срок хранения 60 дней — осталось 43 дня</p>
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
