import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/** Минимальный валидный PDF (пустая страница) — запасной вариант без pdf-lib или при ошибке. */
export const MINIMAL_PDF_BASE64 =
  "JVBERi0xLjQKMSAwIG9iago8PC9UeXBlIC9DYXRhbG9nCi9QYWdlcyAyIDAgUgo+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8L1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCAyMDAgMjAwXQo+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmCjAwMDAwMDAwMTAgMDAwMDAgbgowMDAwMDAwMDA5IDAwMDAwIG4KMDAwMDAwMDAwOCAwMDAwMCBuCnRyYWlsZXIKPDwvU2l6ZSA0L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKNjQKJUVPRgo=";

export function downloadMinimalPdf(filename: string) {
  const bytes = Uint8Array.from(atob(MINIMAL_PDF_BASE64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Noto Sans TTF (Google Fonts) — для кириллицы в счёте-демо (ТЗ: PDF сформировать самостоятельно). */
const NOTO_SANS_TTF =
  "https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNb4j5Ba_2c7.ttf";

/**
 * Скачивает PDF со счётом-демо (кириллица при успешной загрузке шрифта).
 */
export async function downloadInvoicePdf(filename: string) {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    let font;
    let cyrillic = false;
    try {
      const fontBytes = await fetch(NOTO_SANS_TTF).then((r) => r.arrayBuffer());
      font = await pdfDoc.embedFont(fontBytes, { subset: true });
      cyrillic = true;
    } catch {
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }

    const lines = cyrillic
      ? [
          "Счёт (демо)",
          "Сквозь тернии к звёздам",
          "Билайн One — бизнес",
          "Оплата: по реквизитам или карте (макет)."
        ]
      : ["Invoice demo", "B2B Beeline One", "PDF fallback (no Cyrillic font)."];

    let y = 760;
    for (const line of lines) {
      page.drawText(line, {
        x: 50,
        y,
        size: 13,
        font,
        color: rgb(0.12, 0.16, 0.22)
      });
      y -= 22;
    }

    const bytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    downloadMinimalPdf(filename);
  }
}
