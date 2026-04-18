import { isCallRecordingProductLabel } from "./widgetProductHelpers";

export type ProductTapResult =
  | { kind: "none" }
  | { kind: "stub"; message: string }
  | { kind: "navigate-recordings" };

export function resolveProductTap(
  title: string,
  recordings: { useMock: boolean; dimmedDisabled: boolean }
): ProductTapResult {
  if (isCallRecordingProductLabel(title)) {
    if (recordings.dimmedDisabled) return { kind: "none" };
    if (recordings.useMock) {
      return { kind: "stub", message: "Записи разговоров (мок из кастомизации)." };
    }
    return { kind: "navigate-recordings" };
  }
  return { kind: "stub", message: `Продукт «${title}» в разработке.` };
}
