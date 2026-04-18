"use client";

import * as React from "react";
import { DocumentsSheetProvider } from "@shared/components/DocumentsSheetProvider";

export function ClassicShellProviders({ children }: { children: React.ReactNode }) {
  return <DocumentsSheetProvider>{children}</DocumentsSheetProvider>;
}
