"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { MobileSkills } from "./MobileSkills";

const DesktopConstellation = dynamic(() => import("./SkillsConstellation").then((module) => module.SkillsConstellation));

const desktopQuery = "(min-width: 64rem)";
function subscribe(onChange: () => void) {
  const media = window.matchMedia(desktopQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
function isDesktop() {
  return window.matchMedia(desktopQuery).matches;
}

export function SkillsLandscape() {
  const desktop = useSyncExternalStore(subscribe, isDesktop, () => false);

  return (
    <div id="knowledge" className="bg-[#030303] lg:min-h-screen">
      <MobileSkills />
      {desktop && <DesktopConstellation />}
    </div>
  );
}
