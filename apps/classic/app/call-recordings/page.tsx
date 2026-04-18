import { redirect } from "next/navigation";

/** Старый URL: записи открываются на экране «Коммуникация». */
export default function CallRecordingsPage() {
  redirect("/communication/");
}
