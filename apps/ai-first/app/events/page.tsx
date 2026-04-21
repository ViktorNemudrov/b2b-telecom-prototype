import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { PageBackLink } from "@shared/components/PageBackLink";
import { EventsFeedScreen } from "@shared/components/screens/EventsFeedScreen";

export default function EventsPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pt-2">
          <div className="relative mb-3 flex min-h-8 items-center justify-center">
            <PageBackLink className="absolute left-0 mb-0" />
            <h1 className="px-2 text-center text-lg font-semibold leading-snug tracking-tight text-[#1F2430] dark:text-slate-100">
              Лента событий
            </h1>
          </div>
          <EventsFeedScreen />
        </div>
      </AppShell>
    </>
  );
}
