"use client";

import * as React from "react";
import { FileText, Phone, Settings } from "lucide-react";
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
              "flex h-8 w-8 items-center justify-center rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--muted))] shadow-softSm transition hover:brightness-110 dark:border-[rgb(var(--border))] dark:bg-[rgb(var(--card))] dark:text-[rgb(var(--muted))]",
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
        <h1 className="text-xl font-semibold leading-tight text-[rgb(var(--text))] dark:text-[rgb(var(--text))]">{title}</h1>
        <p className="mt-1 text-sm text-[rgb(var(--muted))]">{call.phone}</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--surface2))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text))]">
          <span>{call.missed ? "Пропущенный" : "Входящий"}</span>
          <span className="text-[rgb(var(--muted))]">·</span>
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
          <div className="text-base font-semibold text-[rgb(var(--text))]">
            Итоги разговора
          </div>
          <p className="mt-1 text-xs text-[rgb(var(--muted))]">Ключевые моменты разговора и запросы клиента</p>
          <ul className="mt-4 list-disc space-y-2 pl-4 text-sm text-[rgb(var(--text))]">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => openDevelopmentStub("Перезвонить (демо).")}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#E8421E] px-4 py-3 text-sm font-semibold text-white shadow-softSm transition hover:brightness-110 active:translate-y-[1px]"
          >
            <Phone className="h-4 w-4" />
            Перезвонить
          </button>
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
              "mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[rgb(var(--border))] bg-transparent px-4 py-3 text-sm font-semibold text-[rgb(var(--text))] transition hover:brightness-110 active:translate-y-[1px]",
              getCustomizationButtonClasses(transcriptCustom.dimmedDisabled)
            ].join(" ")}
            disabled={transcriptCustom.dimmedDisabled}
          >
            <FileText className="h-4 w-4" />
            Расшифровка
          </button>
          {showTranscript ? (
            <div className="mt-4 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface2))] p-3 text-sm whitespace-pre-wrap text-[rgb(var(--text))]">
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
