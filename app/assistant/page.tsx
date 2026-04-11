import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { AiAssistantScreen } from "@/components/screens/AiAssistantScreen";

export default function AssistantPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="safe-px pt-2">
          <p className="text-xs font-medium text-slate-500">Сервисы</p>
          <h1 className="text-lg font-semibold text-slate-900">AI Assistant</h1>
        </div>
        <div className="safe-px pt-2">
          <AiAssistantScreen />
        </div>
      </AppShell>
    </>
  );
}
