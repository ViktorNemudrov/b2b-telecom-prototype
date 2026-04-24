import { redirect } from "next/navigation";

/** Экран «Лента событий» в Classic скрыт: прямой заход перенаправляем на главный экран ассистента. */
export default function EventsPage() {
  redirect("/assistant/");
}
