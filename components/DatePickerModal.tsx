"use client";

import * as React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toLabel(d: Date) {
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря"
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function DatePickerModal({
  open,
  onClose,
  value,
  onChange
}: {
  open: boolean;
  onClose: () => void;
  value: Date;
  onChange: (d: Date) => void;
}) {
  const [cursor, setCursor] = React.useState(() => new Date(value));

  React.useEffect(() => {
    if (open) setCursor(new Date(value));
  }, [open, value]);

  const days = React.useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const start = new Date(first);
    start.setDate(first.getDate() - ((first.getDay() + 6) % 7)); // Monday-start

    return Array.from({ length: 42 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const inMonth = d.getMonth() === month;
      const iso = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
      return { d, inMonth, iso };
    });
  }, [cursor]);

  return (
    <Modal open={open} onClose={onClose} title="Выберите дату">
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-2xl"
          onClick={() => {
            const d = new Date(cursor);
            d.setMonth(d.getMonth() - 1);
            setCursor(d);
          }}
          aria-label="Предыдущий месяц"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Calendar className="h-4 w-4 text-slate-600" />
          {toLabel(new Date(cursor.getFullYear(), cursor.getMonth(), 1)).replace(/^\d+ /, "")}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-2xl"
          onClick={() => {
            const d = new Date(cursor);
            d.setMonth(d.getMonth() + 1);
            setCursor(d);
          }}
          aria-label="Следующий месяц"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs text-slate-500">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((w) => (
          <div key={w} className="py-1 font-semibold">
            {w}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {days.map(({ d, inMonth, iso }) => {
          const selected =
            d.getFullYear() === value.getFullYear() &&
            d.getMonth() === value.getMonth() &&
            d.getDate() === value.getDate();
          return (
            <button
              key={iso}
              className={[
                "h-10 rounded-2xl text-sm font-semibold transition active:translate-y-[1px]",
                inMonth ? "text-slate-900" : "text-slate-400",
                selected
                  ? "bg-gradient-to-r from-accent-teal to-accent-violet text-white shadow-softSm"
                  : "border border-slate-200 bg-white hover:bg-slate-50"
              ].join(" ")}
              onClick={() => {
                onChange(d);
                onClose();
              }}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            onChange(new Date());
            onClose();
          }}
        >
          Сегодня
        </Button>
      </div>
    </Modal>
  );
}

