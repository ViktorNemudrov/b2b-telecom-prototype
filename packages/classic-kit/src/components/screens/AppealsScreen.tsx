"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight, Paperclip } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { Modal } from "@shared/components/ui/modal";
import { cn } from "@shared/components/ui/cn";
import {
  appealTopicOptions,
  filterAppealsBySearch,
  getAppealById,
  getAppealsFiltered,
  type AppealItem,
  type AppealsListFilter
} from "@shared/lib/mockData";
import { appealsPathPreservingFrom } from "@shared/lib/appealsBackFallback";
import { appendRuntimeUserAppeal, useRuntimeUserAppeals } from "@shared/lib/runtimeAppeals";

const APPEALS_UI_SESSION_KEY = "b2b-classic.appealsUi.v1";

function loadAppealsUiFromSession(): Partial<{
  filter: AppealsListFilter;
  search: string;
  expandedAll: boolean;
}> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(APPEALS_UI_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return parsed as Partial<{ filter: AppealsListFilter; search: string; expandedAll: boolean }>;
  } catch {
    return null;
  }
}

function saveAppealsUiSession(state: {
  filter: AppealsListFilter;
  search: string;
  expandedAll: boolean;
}) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(APPEALS_UI_SESSION_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function AppealRow({ a, onOpen }: { a: AppealItem; onOpen: () => void }) {
  return (
    <button
      type="button"
      className="flex w-full items-start justify-between gap-2 border-b border-[rgb(var(--border))] py-3 text-left last:border-0700"
      onClick={onOpen}
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[rgb(var(--text))]">{a.title}</div>
        <div className="text-xs text-[rgb(var(--muted))]">
          {a.category} · ID от {a.dateLabel}
        </div>
      </div>
      <span className="flex shrink-0 items-center gap-1">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold",
            a.badgeLabel.includes("работе") && "bg-sky-100 text-sky-800900/40200",
            a.badgeLabel.includes("подпис") && "bg-amber-100 text-amber-900900/40100",
            a.badgeLabel === "Выполнено" && "bg-emerald-100 text-emerald-800900/40200",
            a.badgeLabel === "Отклонено" && "bg-[rgb(var(--surface-2))] text-[rgb(var(--text))]600200"
          )}
        >
          {a.badgeLabel}
        </span>
        <ChevronRight className="h-4 w-4 text-[rgb(var(--text))]" aria-hidden />
      </span>
    </button>
  );
}

export function AppealsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createdAppeals = useRuntimeUserAppeals();

  const [filter, setFilter] = React.useState<AppealsListFilter>("all");
  const [expandedAll, setExpandedAll] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [topic, setTopic] = React.useState<string>(appealTopicOptions[0]?.title ?? "");
  const [body, setBody] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [attachedName, setAttachedName] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<AppealItem | null>(null);
  const [submitNotice, setSubmitNotice] = React.useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [sessionUiReady, setSessionUiReady] = React.useState(false);

  React.useEffect(() => {
    const saved = loadAppealsUiFromSession();
    if (
      saved?.filter === "all" ||
      saved?.filter === "in_work" ||
      saved?.filter === "done" ||
      saved?.filter === "rejected"
    ) {
      setFilter(saved.filter);
      setExpandedAll(saved.filter !== "all");
    }
    if (typeof saved?.search === "string") setSearch(saved.search);
    if (typeof saved?.expandedAll === "boolean") setExpandedAll(saved.expandedAll);
    setSessionUiReady(true);
  }, []);

  React.useEffect(() => {
    if (!sessionUiReady) return;
    saveAppealsUiSession({ filter, search, expandedAll });
  }, [sessionUiReady, filter, search, expandedAll]);

  const createdByFilter = React.useMemo(() => {
    if (filter === "done") return createdAppeals.filter((a) => a.status === "done");
    if (filter === "rejected") return createdAppeals.filter((a) => a.status === "rejected");
    if (filter === "in_work") {
      return createdAppeals.filter(
        (a) => a.status === "active" && (a.badgeLabel === "В работе" || a.badgeLabel.includes("работе"))
      );
    }
    return createdAppeals;
  }, [createdAppeals, filter]);
  const baseList = [...createdByFilter, ...getAppealsFiltered(filter)];
  const searched = filterAppealsBySearch(baseList, search);
  const list = searched;
  const visible = filter === "all" && !expandedAll ? list.slice(0, 3) : list;
  const activeAppeals = React.useMemo(() => [...createdAppeals, ...getAppealsFiltered("all")].filter((a) => a.status === "active"), [createdAppeals]);
  const inWorkCount = React.useMemo(() => activeAppeals.filter((a) => a.badgeLabel.includes("работе")).length, [activeAppeals]);
  const signPendingCount = React.useMemo(
    () => activeAppeals.filter((a) => a.badgeLabel.includes("подпис")).length,
    [activeAppeals]
  );

  React.useEffect(() => {
    const openId = searchParams.get("open");
    if (!openId) return;
    const fromCreated = createdAppeals.find((a) => a.id === openId);
    const fromMock = getAppealById(openId);
    const found = fromCreated ?? fromMock;
    if (found) {
      setDetail(found);
      router.replace(appealsPathPreservingFrom(searchParams), { scroll: false });
    }
  }, [searchParams, createdAppeals, router]);

  const onSubmitAppeal = () => {
    if (!body.trim()) {
      setSubmitNotice({ kind: "error", text: "Введите текст обращения перед отправкой." });
      return;
    }
    const newAppeal: AppealItem = {
      id: `new-${Date.now()}`,
      title: topic,
      status: "active",
      badgeLabel: "В работе",
      category: "Техподдержка",
      dateLabel: new Date().toLocaleDateString("ru-RU"),
      description: body.trim(),
      history: [{ at: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }), text: "Обращение отправлено." }]
    };
    appendRuntimeUserAppeal(newAppeal);
    setSubmitNotice({ kind: "ok", text: `Обращение отправлено. Тема: «${topic}».` });
    setBody("");
    setAttachedName(null);
    setCreateOpen(false);
  };

  return (
    <div className="space-y-4 pb-6">
      <p className="text-sm text-[rgb(var(--text))]300">
        Сейчас у вас: <span className="font-semibold">{activeAppeals.length} активных обращения</span>
        <br />
        В работе: {inWorkCount} · Ожидает подписания: {signPendingCount}
      </p>

      <Button
        className="w-full rounded-2xl bg-[rgb(var(--surface-2))] py-6 text-base font-semibold text-white"
        onClick={() => setCreateOpen((v) => !v)}
      >
        Создать обращение
      </Button>

      {submitNotice ? (
        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm",
            submitNotice.kind === "ok" &&
              "border-emerald-200 bg-emerald-50 text-emerald-800800/60900/30200",
            submitNotice.kind === "error" &&
              "border-rose-200 bg-rose-50 text-rose-800800/60900/30200"
          )}
        >
          {submitNotice.text}
        </div>
      ) : null}

      {createOpen ? (
        <Card className="border-[rgb(var(--border))]800/80">
          <CardContent className="space-y-3 pb-4 pt-4">
            <label className="text-xs font-semibold text-[rgb(var(--muted))]">Тема</label>
            <select
              className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--text))]600900100"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              {appealTopicOptions.map((o) => (
                <option key={o.title} value={o.title}>
                  {o.title} — {o.subtitle}
                </option>
              ))}
            </select>
            <label className="text-xs font-semibold text-[rgb(var(--muted))]">Текст</label>
            <textarea
              className="min-h-[88px] w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--text))]600900100"
              placeholder="Опишите запрос…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setAttachedName(f ? f.name : null);
              }}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl600200"
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip className="mr-2 h-4 w-4" />
                Прикрепить файл
              </Button>
              {attachedName ? (
                <span className="self-center text-xs text-[rgb(var(--muted))]">{attachedName}</span>
              ) : null}
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" className="flex-1 rounded-2xl" onClick={onSubmitAppeal}>
                Отправить
              </Button>
            </div>
            <p className="text-[11px] text-[rgb(var(--muted))]">
              Созданные обращения сохраняются в этом браузере (демо).
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card
        className={cn(
          "border-[rgb(var(--border))]800/50",
          !(filter === "all" && expandedAll) && "max-h-[min(420px,55vh)] overflow-y-auto"
        )}
      >
        <CardContent className="pb-2 pt-2">
          {visible.map((a) => (
            <AppealRow key={a.id} a={a} onOpen={() => setDetail(a)} />
          ))}
          {filter === "all" && list.length > 3 ? (
            <button
              type="button"
              className="mt-2 flex w-full items-center justify-center gap-1 py-2 text-center text-sm font-semibold text-[rgb(var(--text))]"
              onClick={() => setExpandedAll((v) => !v)}
            >
              {expandedAll ? (
                <>
                  Свернуть <ChevronDown className="h-4 w-4" />
                </>
              ) : (
                <>
                  Все обращения <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-[rgb(var(--muted))]">Поиск по обращениям</label>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Дата, договор, тема, статус…"
          className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2.5 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))]600900100 dark:placeholder:text-[rgb(var(--muted))]"
        />
        <p className="text-xs text-[rgb(var(--muted))]">
          Укажите дату создания, номер договора или контекст — список отфильтруется.
        </p>
      </div>

      <Card className="dark:border-[rgb(var(--border))]/50">
        <CardContent className="divide-y divide-[rgb(var(--border))] p-0 dark:divide-[rgb(var(--border))]">
          {(
            [
              ["Все обращения", "all" as const],
              ["В работе", "in_work" as const],
              ["Выполненные", "done" as const],
              ["Отклонённые", "rejected" as const]
            ] as const
          ).map(([label, key]) => (
            <button
              key={key}
              type="button"
              className={cn(
                "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[rgb(var(--text))]",
                filter === key ? "bg-[rgb(var(--surface-2))]/50" : ""
              )}
              onClick={() => {
                setFilter(key);
                setExpandedAll(key !== "all");
              }}
            >
              {label}
              <ChevronRight className="h-4 w-4 text-[rgb(var(--muted))]" />
            </button>
          ))}
        </CardContent>
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.title ?? "Обращение"}>
        {detail ? (
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-bold",
                  detail.badgeLabel.includes("работе") && "bg-sky-100 text-sky-800",
                  detail.badgeLabel.includes("подпис") && "bg-amber-100 text-amber-900",
                  detail.badgeLabel === "Выполнено" && "bg-emerald-100 text-emerald-800",
                  detail.badgeLabel === "Отклонено" && "bg-[rgb(var(--surface-2))] text-[rgb(var(--text))]"
                )}
              >
                {detail.badgeLabel}
              </span>
              <span className="text-xs text-[rgb(var(--muted))]">
                {detail.category} · от {detail.dateLabel}
              </span>
            </div>
            <p className="leading-relaxed text-[rgb(var(--text))]">{detail.description}</p>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">История</div>
              <ul className="mt-2 space-y-2 border-t border-[rgb(var(--border))] pt-2600">
                {detail.history.map((h) => (
                  <li key={`${h.at}-${h.text.slice(0, 12)}`} className="text-[rgb(var(--text))]300">
                    <span className="font-medium text-[rgb(var(--muted))]">{h.at}</span> — {h.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
