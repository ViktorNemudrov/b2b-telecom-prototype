"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { Modal } from "@shared/components/ui/modal";
import { cn } from "@shared/components/ui/cn";
import { openDevelopmentStub } from "@shared/lib/developmentStub";
import { downloadInvoicePdf } from "@shared/lib/minimalPdf";
import { getInvoiceById } from "@shared/lib/mockData";
import { goSmartBack } from "@shared/lib/smartBack";

export function InvoiceDetailClient({
  id,
  backHref = "/invoices/"
}: {
  id: string;
  backHref?: string;
}) {
  const router = useRouter();
  const inv = getInvoiceById(id);
  const [payOpen, setPayOpen] = React.useState(false);
  const [qrActive, setQrActive] = React.useState(false);

  if (!inv) {
    return (
      <div className="safe-px py-8 text-center text-sm text-slate-500">
        Счёт не найден.
        <button
          type="button"
          className="mt-4 block w-full font-semibold text-accent-dark"
          onClick={() => goSmartBack(router, backHref)}
        >
          Назад
        </button>
      </div>
    );
  }

  const statusLabel =
    inv.status === "paid" ? "Оплачен" : inv.status === "pending" ? "В оплате" : "Оплатить";

  return (
    <div className="space-y-4 pb-8">
      <button
        type="button"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        onClick={() => goSmartBack(router, backHref)}
      >
        <ChevronLeft className="h-4 w-4" />
        Назад
      </button>

      <Card className="dark:border-slate-700">
        <CardContent className="space-y-2 pb-5 pt-5">
          <div className="text-2xl font-bold">{inv.amountRub.toLocaleString("ru-RU")} ₽</div>
          <div className="text-sm text-slate-500">{inv.meta}</div>
          <div
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-xs font-bold",
              inv.status === "paid" && "bg-emerald-100 text-emerald-800",
              inv.status === "pending" && "bg-amber-100 text-amber-900",
              inv.status === "pay" && "bg-rose-100 text-rose-800"
            )}
          >
            {statusLabel}
          </div>
          {inv.status === "pay" ? (
            <p className="text-sm text-rose-700 dark:text-rose-300">
              Есть задолженность по счёту. Оплатите удобным способом или скачайте PDF для бухгалтерии.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="flex-1 rounded-2xl dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          onClick={() => void downloadInvoicePdf(`schet-${id}-demo.pdf`)}
        >
          Скачать PDF
        </Button>
        {inv.status === "pay" ? (
          <Button className="flex-1 rounded-2xl" onClick={() => setPayOpen(true)}>
            Оплатить
          </Button>
        ) : null}
      </div>

      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Оплата">
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">Выберите способ оплаты (демо).</p>
          <Button
            className="w-full rounded-2xl"
            onClick={() => {
              setQrActive(true);
              navigator.mediaDevices
                ?.getUserMedia?.({ video: { facingMode: "environment" } })
                .then((stream) => {
                  stream.getTracks().forEach((t) => t.stop());
                  openDevelopmentStub("Камера: поиск QR (демо).");
                })
                .catch(() => openDevelopmentStub("Камера недоступна — имитация сканирования QR."));
            }}
          >
            Оплатить по QR-коду
          </Button>
          {qrActive ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
              Наведите камеру на QR (в демо камера могла закрыться сразу после проверки).
            </div>
          ) : null}
          <Button
            variant="secondary"
            className="w-full justify-start gap-2 rounded-2xl"
            onClick={() => openDevelopmentStub("Оплата через Сбербанк (мок).")}
          >
            <Image src="/mockups/sber-icon.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
            Сбербанк
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-start gap-2 rounded-2xl"
            onClick={() => openDevelopmentStub("Оплата через Тинькофф (мок).")}
          >
            <Image src="/mockups/tinkoff-icon.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
            Тинькофф
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-start gap-2 rounded-2xl"
            onClick={() => openDevelopmentStub("Оплата через Яндекс Банк (мок).")}
          >
            <Image src="/mockups/yandex-bank-icon.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
            Яндекс Банк
          </Button>
          <Button
            className="w-full rounded-2xl bg-accent-yellow text-accent-dark hover:brightness-95"
            onClick={() => openDevelopmentStub("Реквизиты для перевода (мок).")}
          >
            Оплата по реквизитам
          </Button>
          <div className="space-y-1 rounded-xl border border-slate-200 p-3 dark:border-slate-600">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Карта</div>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Номер карты"
            />
            <div className="flex gap-2">
              <input
                className="w-1/2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                placeholder="ММ/ГГ"
              />
              <input
                className="w-1/2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                placeholder="CVC"
              />
            </div>
            <Button
              className="w-full rounded-xl bg-accent-yellow text-accent-dark hover:brightness-95"
              onClick={() => openDevelopmentStub("Оплата картой (мок).")}
            >
              Оплатить картой
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
