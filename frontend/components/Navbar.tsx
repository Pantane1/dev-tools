"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Search, TerminalSquare } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InstallAppButton } from "@/components/InstallAppButton";

// Lazy-loaded: the search dialog's logic and markup are only needed once
// the user actually opens it (click or ⌘K), so keeping it out of the
// initial bundle shaves a small amount off first-load JS on every page.
const SearchDialog = dynamic(() => import("@/components/SearchDialog").then((mod) => mod.SearchDialog), {
  ssr: false,
});

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
            <TerminalSquare size={18} className="text-brand-600" />
            Pantane DevTools
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-ink-muted sm:flex dark:text-slate-400">
            <Link href="/tools" className="transition-colors hover:text-ink dark:hover:text-slate-100">
              Tools
            </Link>
            <a
              href="https://www.pantane.is-a.dev"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-ink dark:hover:text-slate-100"
            >
              Pantane Hub
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <InstallAppButton />
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search tools"
              className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface-subtle px-3 text-sm text-ink-faint
                transition-colors hover:text-ink-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500 dark:hover:text-slate-300"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Search tools</span>
              <kbd className="kbd hidden sm:inline-flex">⌘K</kbd>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
