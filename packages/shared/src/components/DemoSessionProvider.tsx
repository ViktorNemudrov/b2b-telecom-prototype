"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const LEGACY_STORAGE_KEY = "b2b_demo_session_v1";

type DemoSessionContextValue = {
  authenticated: boolean;
  signIn: () => void;
  signOut: () => void;
};

const DemoSessionContext = createContext<DemoSessionContextValue | null>(null);

export function DemoSessionProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const signIn = useCallback(() => setAuthenticated(true), []);
  const signOut = useCallback(() => setAuthenticated(false), []);

  const value = useMemo(
    () => ({
      authenticated,
      signIn,
      signOut
    }),
    [authenticated, signIn, signOut]
  );

  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>;
}

export function useDemoSession(): DemoSessionContextValue {
  const ctx = useContext(DemoSessionContext);
  if (!ctx) {
    throw new Error("useDemoSession должен вызываться внутри DemoSessionProvider");
  }
  return ctx;
}
