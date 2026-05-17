"use client";

import { useEffect, useState } from "react";
import { getGenerationProgressMessage } from "@/lib/generation-progress";

/** Tracks elapsed generation time and returns the current status line. */
export function useGenerationProgress(active: boolean) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [message, setMessage] = useState(getGenerationProgressMessage(0));

  useEffect(() => {
    if (!active) {
      setStartedAt(null);
      setMessage(getGenerationProgressMessage(0));
      return;
    }

    const start = Date.now();
    setStartedAt(start);

    const tick = () => {
      const elapsedSec = (Date.now() - start) / 1000;
      setMessage(getGenerationProgressMessage(elapsedSec));
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [active]);

  return { message, startedAt };
}
