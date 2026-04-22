import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { ClassicBottomTabBar } from "@shared/components/ClassicBottomTabBar";
import { PageBackLink } from "@shared/components/PageBackLink";
import { EventsFeedScreen } from "@shared/components/screens/EventsFeedScreen";

export default function EventsPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pb-24 pt-0">
          <div className="relative mb-3 flex min-h-8 items-center justify-center">
            <PageBackLink className="absolute left-0 mb-0 h-8 w-8 p-0 leading-none" />
            <h1 className="text-center text-lg font-bold text-slate-900 dark:text-slate-100">
              Лента событий
            </h1>
          </div>
          <EventsFeedScreen showTitle={false} />
        </div>
      </AppShell>
      <ClassicBottomTabBar />
    </>
  );
}
