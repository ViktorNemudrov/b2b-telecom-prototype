/** Карточка «Запись разговоров» / «Запись звонков» ведёт на экран записей. */
export function isCallRecordingProductLabel(title: string): boolean {
  const t = title.trim().toLowerCase();
  return t.includes("запись") && (t.includes("разговор") || t.includes("звонк"));
}
