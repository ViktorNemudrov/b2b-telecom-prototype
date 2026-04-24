"use client";

import * as React from "react";
import { DocumentsSheetProvider } from "@shared/components/DocumentsSheetProvider";
import { NativeBackBridge } from "@shared/components/NativeBackBridge";

export function ClassicShellProviders({ children }: { children: React.ReactNode }) {
  return (
    <DocumentsSheetProvider>
      <NativeBackBridge />
      {children}
    </DocumentsSheetProvider>
  );
}
