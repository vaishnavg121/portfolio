"use client";

import { useEffect, useState } from "react";
import { BootSlash } from "@/components/effects";

export const EntrySequence = () => {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Check reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsComplete(true);
      return;
    }
  }, []);

  if (isComplete) return null;

  return (
    <>
      <div className="boot-overlay fixed inset-0 z-[100] bg-background pointer-events-none" />
      <BootSlash onComplete={() => setIsComplete(true)} />
    </>
  );
};

