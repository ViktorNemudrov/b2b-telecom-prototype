import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { AppCustomizationScreen } from "@shared/components/screens/AppCustomizationScreen";

export default function CustomizationPage() {
  return (
    <>
      <AppHeader />
      <AppShell>
        <div className="pb-24">
          <AppCustomizationScreen backHref="/settings/" appVariant="classic" />
        </div>
      </AppShell>
    </>
  );
}
