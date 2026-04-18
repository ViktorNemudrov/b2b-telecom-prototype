import { isCallRecordingProductLabel } from "./widgetProductHelpers";

export type ProductTapResult =
  | { kind: "none" }
  | { kind: "stub"; message: string }
  | { kind: "navigate-communication" };

export function resolveProductTap(
  title: string,
  recordings: { useMock: boolean; dimmedDisabled: boolean }
): ProductTapResult {
  if (isCallRecordingProductLabel(title)) {
    if (recordings.dimmedDisabled) return { kind: "none" };
    if (recordings.useMock) {
      return { kind: "stub", message: "Записи разговоров (мок из кастомизации)." };
    }
    return { kind: "navigate-communication" };
  }
  return { kind: "stub", message: `Продукт «${title}» в разработке.` };
}
