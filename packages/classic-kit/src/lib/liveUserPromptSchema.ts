import { z } from "zod";

const injectionPatterns = [
  /ignore\s+(previous|all|above)\s+instructions/i,
  /забудь\s+(все\s+)?(правила|инструкции)/i,
  /system\s*prompt/i,
  /раскрой\s+(системн|промпт)/i
];

export const liveUserPromptSchema = z
  .string()
  .trim()
  .min(1, "Введите вопрос.")
  .max(4000, "Слишком длинное сообщение (макс. 4000 символов).")
  .refine((s) => s.replace(/\s/g, "").length > 0, "Пустой ввод.")
  .refine((s) => !injectionPatterns.some((re) => re.test(s)), "Запрос отклонён по правилам безопасности.");

export type LiveUserPromptInput = z.infer<typeof liveUserPromptSchema>;

export function safeParseLiveUserPrompt(raw: string): { ok: true; value: string } | { ok: false; error: string } {
  const r = liveUserPromptSchema.safeParse(raw);
  if (r.success) return { ok: true, value: r.data };
  const msg = r.error.flatten().formErrors[0] ?? r.error.message;
  return { ok: false, error: msg };
}
