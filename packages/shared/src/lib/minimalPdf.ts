import { PDFDocument, rgb } from "pdf-lib";

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

async function createTextImagePng(lines: string[]) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 420;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1F2937";
  ctx.font = "600 52px Inter, Arial, sans-serif";
  ctx.textBaseline = "top";

  let y = 24;
  for (const line of lines) {
    ctx.fillText(line, 24, y);
    y += 92;
  }
  return canvas.toDataURL("image/png");
}

/**
 * Скачивает PDF со счётом-демо (кириллица при успешной загрузке шрифта).
 */
export async function downloadInvoicePdf(filename: string) {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const lines = [
      "Счёт (демо)",
      "Сквозь тернии к звёздам",
      "Билайн One — бизнес",
      "Оплата: по реквизитам или карте (макет)."
    ];

    const textPngDataUrl = await createTextImagePng(lines);
    if (textPngDataUrl) {
      const pngBytes = await fetch(textPngDataUrl).then((r) => r.arrayBuffer());
      const pngImage = await pdfDoc.embedPng(pngBytes);
      const imgW = 520;
      const imgH = (pngImage.height / pngImage.width) * imgW;
      page.drawImage(pngImage, { x: 38, y: 841.89 - imgH - 60, width: imgW, height: imgH });
    } else {
      page.drawText("Invoice demo", { x: 50, y: 760, size: 14, color: rgb(0.12, 0.16, 0.22) });
      page.drawText("B2B Beeline One", { x: 50, y: 735, size: 14, color: rgb(0.12, 0.16, 0.22) });
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
