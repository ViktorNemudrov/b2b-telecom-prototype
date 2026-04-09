"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { AiAssistantScreen } from "@/components/screens/AiAssistantScreen";
import { FeedScreen } from "@/components/screens/FeedScreen";

type TabKey = "assistant" | "feed";

export default function HomePage() {
  const [tab, setTab] = useState<TabKey>("assistant");
  const tabs = useMemo(
    () => [
      { key: "assistant" as const, label: "AI Assistant" },
      { key: "feed" as const, label: "Лента" }
    ],
    []
  );

  return (
    <div className="relative min-h-dvh">
      <TopNav tabs={tabs} value={tab} onChange={setTab} />

      <div className="safe-px pb-28 pt-3">
        <AnimatePresence mode="wait">
          {tab === "assistant" ? (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <AiAssistantScreen />
            </motion.div>
          ) : (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <FeedScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

