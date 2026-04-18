/**
 * Пост-обработка ответа модели: детекция повторов/мусора до показа в UI.
 */

const WORD_RE = /[\p{L}\p{N}]+/gu;

export function tokenizeWords(text: string): string[] {
  return text.toLowerCase().match(WORD_RE) ?? [];
}

/** Доля повторяющихся слов: 0 = все уникальны, 1 = все одинаковые. */
export function repetitionRatio(text: string): number {
  const words = tokenizeWords(text);
  if (words.length < 8) return 0;
  const unique = new Set(words);
  return 1 - unique.size / words.length;
}

/** Повтор одной и той же строки (часто у зацикленных моделей). */
export function maxLineRepeatCount(text: string): number {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return 1;
  const counts = new Map<string, number>();
  let max = 1;
  for (const line of lines) {
    const k = line.slice(0, 200);
    const n = (counts.get(k) ?? 0) + 1;
    counts.set(k, n);
    if (n > max) max = n;
  }
  return max;
}

export function shouldRejectModelOutput(text: string): boolean {
  const t = text.trim();
  if (t.length < 8) return true;
  if (t.length > 8000) return true;
  if (repetitionRatio(t) > 0.62 && tokenizeWords(t).length >= 24) return true;
  if (maxLineRepeatCount(t) >= 5) return true;
  return false;
}
