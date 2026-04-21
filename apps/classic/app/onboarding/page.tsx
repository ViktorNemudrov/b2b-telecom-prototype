import { OnboardingScreen } from "@shared/components/screens/OnboardingScreen";

export default function OnboardingPage({
  searchParams
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const fromSettings = searchParams?.from === "settings";

  return <OnboardingScreen showBack={fromSettings} backHref="/settings/" />;
}
