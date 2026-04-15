"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { Modal } from "@shared/components/ui/modal";
import { cn } from "@shared/components/ui/cn";
import { downloadInvoicePdf } from "@shared/lib/minimalPdf";
import { markInvoicePaid, useRuntimeInvoices } from "@shared/lib/runtimeInvoices";
import { goSmartBack } from "@shared/lib/smartBack";

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
        {inv.status !== "paid" ? (
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
          >
            Оплатить по QR-коду
          </Button>
          {qrActive ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500 dark:border-slate-600 dark:text-slate-300">
              <div className="mx-auto mb-3 h-32 w-32 overflow-hidden rounded-xl border-2 border-accent-yellow bg-black">
                <video ref={qrVideoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
              </div>
              Камера активна 5 сек. Наведите видоискатель на QR-код.
            </div>
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
            onClick={() => setCardOpen(true)}
          >
            Оплата банковской картой
          </Button>
          <Button
            className="w-full rounded-2xl bg-accent-yellow text-accent-dark hover:brightness-95"
            onClick={() => {
              setPayOpen(false);
              setToast("Оплата по реквизитам (мок): реквизиты отправлены на e-mail.");
            }}
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
