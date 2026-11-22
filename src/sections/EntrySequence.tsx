"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { BootSlash, PortfolioLoader } from "@/components/effects";

export const EntrySequence = () => {
  const [stage, setStage] = useState(0); // 0: loader, 1: slash, 2: done

  const showSlash = useCallback(() => setStage(1), []);
  const finish = useCallback(() => setStage(2), []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStage(2);
    }
  }, []);

  if (stage === 2) return null;

  return (
    <>
      <AnimatePresence>
        {stage === 0 && (
          <PortfolioLoader key="loader" onComplete={showSlash} />
        )}
      </AnimatePresence>

      {stage === 1 && <BootSlash onComplete={finish} />}
    </>
  );
};

