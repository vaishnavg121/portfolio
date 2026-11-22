"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ChatbotLauncher } from "./ChatbotLauncher";

const sections = [
  ["work", "Selected work"],
  ["knowledge", "Skills landscape"],
  ["about", "Experience & education"],
  ["robotics", "ThriveForce robotics"],
  ["github", "GitHub activity"],
  ["notes", "Engineering notes"],
  ["contact", "Contact"],
];

export function MobileNavigation() {
  const menu = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");
    const closeOnDesktop = () => {
      if (desktop.matches) menu.current?.close();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <header className="mobile-header lg:contents">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 sm:px-6 lg:contents">
        <Link href="/#hero" className="inline-flex min-h-12 items-center lg:hidden font-mono text-sm font-semibold tracking-widest">
          VG / 121
        </Link>
        <div className="flex items-center gap-2 lg:contents">
          <ChatbotLauncher />
          <button type="button" aria-haspopup="dialog" aria-controls="mobile-menu" onClick={() => menu.current?.showModal()}
            className="inline-flex min-h-12 items-center gap-2 px-2 font-mono text-sm uppercase tracking-wider lg:hidden">
            Menu <Menu aria-hidden="true" size={19} />
          </button>
        </div>
      </div>
      <dialog id="mobile-menu" ref={menu} aria-labelledby="mobile-menu-title"
        className="mobile-menu border border-border bg-surface text-text-primary backdrop:bg-black/75"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}>
        <div className="px-5 py-3">
          <div className="flex items-center justify-between border-b border-border">
            <h2 id="mobile-menu-title" className="font-mono text-sm uppercase tracking-widest text-text-muted">Navigate</h2>
            <button type="button" aria-label="Close menu" onClick={() => menu.current?.close()} className="grid size-11 place-items-center">
              <X aria-hidden="true" size={20} />
            </button>
          </div>
          <nav aria-label="Portfolio sections" className="divide-y divide-border">
            {sections.map(([id, label]) => (
              <Link key={id} href={`/#${id}`} onClick={() => menu.current?.close()}
                className="flex min-h-12 items-center py-2 font-medium hover:text-white focus-visible:text-white">
                {label}
              </Link>
            ))}
            <button type="button" onClick={() => {
              menu.current?.close();
              window.dispatchEvent(new Event("portfolio:command-palette"));
            }} className="flex min-h-12 w-full items-center py-2 text-left font-medium">
              Command palette
            </button>
          </nav>
        </div>
      </dialog>
    </header>
  );
}
