import { WelcomeScreen } from "@shared/components/screens/WelcomeScreen";

export default function WelcomePage() {
  return <WelcomeScreen loginHref="/auth" whenAuthedHref="/" />;
}
