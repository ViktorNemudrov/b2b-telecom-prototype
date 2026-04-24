"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { CenteredPageTitleBar } from "@shared/components/CenteredPageTitleBar";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { Modal } from "@shared/components/ui/modal";
import { cn } from "@shared/components/ui/cn";
import { downloadInvoicePdf } from "@shared/lib/minimalPdf";
import { markInvoicePaid, useRuntimeInvoices } from "@shared/lib/runtimeInvoices";
import { goSmartBack } from "@shared/lib/smartBack";
import { useUiCustomization } from "@shared/lib/uiCustomization";
import { userProfile } from "@shared/lib/mockData";

export function InvoiceDetailClient({
  id,
  backHref = "/invoices/"
}: {
  id: string;
  backHref?: string;
}) {
  const router = useRouter();
  const invoices = useRuntimeInvoices();
  const inv = invoices.find((item) => item.id === id);
  const [payOpen, setPayOpen] = React.useState(false);
  const [qrActive, setQrActive] = React.useState(false);
  const [cardOpen, setCardOpen] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const qrVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const qrStreamRef = React.useRef<MediaStream | null>(null);
  const payCustom = useUiCustomization("invoice.pay");
  const downloadCustom = useUiCustomization("invoice.download");
  const qrCustom = useUiCustomization("invoice.pay.qr");
  const cardCustom = useUiCustomization("invoice.pay.card");
  const requisitesCustom = useUiCustomization("invoice.pay.requisites");
  // Всегда goSmartBack: не подменяем LIFO на router.push (иначе пропускаются промежуточные экраны).
  const handleBack = React.useCallback(() => {
    goSmartBack(router, backHref);
  }, [backHref, router]);

  if (!inv) {
    return (
      <div className="safe-px py-8 text-center text-sm text-slate-500">
        <p>Счёт не найден.</p>
        <button
          type="button"
          aria-label="Назад"
          className="mx-auto mt-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F2F7] font-semibold text-accent-dark dark:bg-slate-700"
          onClick={handleBack}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
      </div>
    );
  }

  const badgeLabel =
    inv.status === "paid" ? "Оплачен" : inv.status === "pending" ? "В оплате" : "Оплатить";
  const detailStatusLabel =
    inv.status === "paid" ? "Оплачен" : inv.status === "pending" ? "В оплате" : "К оплате";
  const accrualMain = Math.round(inv.amountRub * 0.72);
  const accrualExtra = inv.amountRub - accrualMain;
  const completePayment = () => {
    markInvoicePaid(inv.id);
    setPayOpen(false);
    setQrActive(false);
    setCardOpen(false);
    setToast("Оплата прошла, но это не точно");
  };

  const stopQrStream = React.useCallback(() => {
    qrStreamRef.current?.getTracks().forEach((t) => t.stop());
    qrStreamRef.current = null;
    if (qrVideoRef.current) qrVideoRef.current.srcObject = null;
  }, []);

  React.useEffect(() => {
    return () => stopQrStream();
  }, [stopQrStream]);

  React.useEffect(() => {
    if (!payOpen) {
      setQrActive(false);
      stopQrStream();
    }
  }, [payOpen, stopQrStream]);

  return (
    <div className="space-y-4 pb-8">
      <CenteredPageTitleBar
        title="Счёт"
        backHref={backHref}
        className="mb-1"
      />

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
            {badgeLabel}
          </div>
          {inv.status === "pay" ? (
            <p className="text-sm text-rose-700 dark:text-rose-300">
              Есть задолженность по счёту. Оплатите удобным способом или скачайте PDF для бухгалтерии.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <details className="group rounded-2xl border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800/50" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 [&::-webkit-details-marker]:hidden">
            Общая информация
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" aria-hidden />
          </summary>
          <div className="space-y-2 border-t border-slate-100 px-4 pb-4 pt-2 text-sm leading-relaxed text-slate-700 dark:border-slate-600 dark:text-slate-300">
            <div className="flex justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">Документ / номер</span>
              <span className="max-w-[60%] text-right font-medium text-slate-900 dark:text-slate-100">{inv.meta}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">Период</span>
              <span className="font-medium">{inv.periodLabel}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">Срок оплаты</span>
              <span className="font-medium">{inv.dueLabel}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400">Статус</span>
              <span className="font-medium">{detailStatusLabel}</span>
            </div>
          </div>
        </details>

        <details className="group rounded-2xl border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800/50">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 [&::-webkit-details-marker]:hidden">
            Реквизиты
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" aria-hidden />
          </summary>
          <div className="space-y-2 border-t border-slate-100 px-4 pb-4 pt-2 text-sm leading-relaxed text-slate-700 dark:border-slate-600 dark:text-slate-300">
            <p>
              <span className="text-slate-500 dark:text-slate-400">Получатель:</span> {userProfile.legalName}
            </p>
            <p>
              <span className="text-slate-500 dark:text-slate-400">ИНН:</span> 771234567890
            </p>
            <p>
              <span className="text-slate-500 dark:text-slate-400">Р/с:</span> 40702 810 5 0000 012345 в ПАО «Демо-Банк»
            </p>
            <p>
              <span className="text-slate-500 dark:text-slate-400">БИК:</span> 044525225, к/с 30101 810 5 0000 00001234
            </p>
          </div>
        </details>

        <details className="group rounded-2xl border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800/50">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 [&::-webkit-details-marker]:hidden">
            Начисления
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" aria-hidden />
          </summary>
          <div className="space-y-2 border-t border-slate-100 px-4 pb-4 pt-2 text-sm dark:border-slate-600">
            <div className="flex justify-between gap-2 text-slate-700 dark:text-slate-300">
              <span>Абонентская плата и пакеты</span>
              <span className="tabular-nums font-medium">{accrualMain.toLocaleString("ru-RU")} ₽</span>
            </div>
            <div className="flex justify-between gap-2 text-slate-700 dark:text-slate-300">
              <span>Дополнительные услуги и оборудование</span>
              <span className="tabular-nums font-medium">{accrualExtra.toLocaleString("ru-RU")} ₽</span>
            </div>
            <div className="flex justify-between gap-2 border-t border-slate-100 pt-2 text-slate-900 dark:border-slate-600 dark:text-slate-100">
              <span className="font-semibold">Итого</span>
              <span className="tabular-nums font-bold">{inv.amountRub.toLocaleString("ru-RU")} ₽</span>
            </div>
          </div>
        </details>
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="flex-1 rounded-2xl dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          onClick={() => {
            if (downloadCustom.useMock) {
              setToast("Скачать PDF (мок из кастомизации).");
              return;
            }
            void downloadInvoicePdf(`schet-${id}-demo.pdf`);
          }}
          disabled={downloadCustom.dimmedDisabled}
        >
          Скачать PDF
        </Button>
        {inv.status !== "paid" ? (
          <Button
            className="flex-1 rounded-2xl"
            onClick={() => {
              if (payCustom.useMock) {
                setToast("Оплатить (мок из кастомизации).");
                return;
              }
              setPayOpen(true);
            }}
            disabled={payCustom.dimmedDisabled}
          >
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
              if (qrCustom.useMock) {
                setToast("Оплата по QR-коду (мок из кастомизации).");
                return;
              }
              setQrActive(true);
              const mediaDevices = typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
              if (!mediaDevices?.getUserMedia) {
                window.setTimeout(() => completePayment(), 5000);
                return;
              }
              void mediaDevices
                .getUserMedia({ video: { facingMode: "environment" } })
                .then((stream) => {
                  qrStreamRef.current = stream;
                  if (qrVideoRef.current) {
                    qrVideoRef.current.srcObject = stream;
                    void qrVideoRef.current.play().catch(() => undefined);
                  }
                  window.setTimeout(() => {
                    stopQrStream();
                    completePayment();
                  }, 5000);
                })
                .catch(() => {
                  window.setTimeout(() => completePayment(), 5000);
                });
            }}
            disabled={qrCustom.dimmedDisabled}
          >
            Оплатить по QR-коду
          </Button>
          {qrActive ? (
            <>
              <div className="rounded-xl border border-dashed border-slate-300 p-3 text-center text-xs text-slate-500 dark:border-slate-600 dark:text-slate-300">
                Камера активна 5 сек. Открыт увеличенный видоискатель.
              </div>
              <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
                <div className="w-full max-w-[360px] rounded-2xl border-2 border-accent-yellow bg-black p-2 shadow-xl">
                  <div className="aspect-square overflow-hidden rounded-xl border border-accent-yellow/60">
                    <video ref={qrVideoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
                  </div>
                  <p className="mt-2 text-center text-xs text-slate-200">Наведите камеру на QR-код</p>
                </div>
              </div>
            </>
          ) : null}
          <Button
            variant="secondary"
            className="w-full justify-start gap-2 rounded-2xl"
            onClick={completePayment}
          >
            <Image src="/mockups/sber-icon.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
            Сбербанк
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-start gap-2 rounded-2xl"
            onClick={completePayment}
          >
            <Image src="/mockups/tinkoff-icon.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
            Тинькофф
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-start gap-2 rounded-2xl"
            onClick={completePayment}
          >
            <Image src="/mockups/yandex-bank-icon.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
            Яндекс Банк
          </Button>
          <Button
            className="w-full rounded-2xl bg-accent-yellow text-accent-dark hover:brightness-95"
            onClick={() => {
              if (cardCustom.useMock) {
                setToast("Оплата банковской картой (мок из кастомизации).");
                return;
              }
              setCardOpen(true);
            }}
            disabled={cardCustom.dimmedDisabled}
          >
            Оплата банковской картой
          </Button>
          <Button
            className="w-full rounded-2xl bg-accent-yellow text-accent-dark hover:brightness-95"
            onClick={() => {
              if (requisitesCustom.useMock) {
                setToast("Оплата по реквизитам (мок из кастомизации).");
                return;
              }
              setPayOpen(false);
              setToast("Оплата по реквизитам (мок): реквизиты отправлены на e-mail.");
            }}
            disabled={requisitesCustom.dimmedDisabled}
          >
            Оплата по реквизитам
          </Button>
        </div>
      </Modal>
      <Modal open={cardOpen} onClose={() => setCardOpen(false)} title="Оплата картой">
        <div className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-600 dark:bg-slate-800/40">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Реквизиты карты</div>
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
          <Button className="w-full rounded-xl bg-accent-yellow text-accent-dark hover:brightness-95" onClick={completePayment}>
            Оплатить картой
          </Button>
        </div>
      </Modal>
      {toast ? (
        <Card className="border-[#E8EAED] dark:border-slate-600">
          <CardContent className="pb-3 pt-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-[#212529] dark:text-slate-100">{toast}</div>
              <button
                type="button"
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-300"
                onClick={() => setToast(null)}
              >
                Закрыть
              </button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
