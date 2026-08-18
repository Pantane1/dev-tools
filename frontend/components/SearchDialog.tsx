"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { TOOLS } from "@/lib/tools-data";

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpenChange]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOOLS.filter((t) => t.status === "live").slice(0, 8);
    return TOOLS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.includes(q))
    ).slice(0, 8);
  }, [query]);

  function go(index: number) {
    const tool = results[index];
    if (!tool || tool.status !== "live") return;
    router.push(`/tools/${tool.slug}`);
    onOpenChange(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(activeIndex);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 px-4 pt-[12vh] backdrop-blur-sm animate-fade-in">
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className="absolute inset-0" onClick={() => onOpenChange(false)} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search tools"
        className="relative z-10 w-full max-w-lg animate-slide-up overflow-hidden rounded-xl border border-border bg-surface shadow-popover dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2 border-b border-border px-3.5 py-3 dark:border-slate-800">
          <Search size={16} className="text-ink-faint dark:text-slate-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search DNS, JWT, JSON, SSL, Hash, QR…"
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint dark:text-slate-100 dark:placeholder:text-slate-600"
          />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close search"
            className="text-ink-faint hover:text-ink-muted dark:text-slate-600 dark:hover:text-slate-400"
          >
            <X size={16} />
          </button>
        </div>

        <ul className="max-h-80 overflow-y-auto p-1.5">
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-ink-faint dark:text-slate-500">No tools match “{query}”.</li>
          )}
          {results.map((tool, index) => (
            <li key={tool.slug}>
              <button
                type="button"
                onClick={() => go(index)}
                onMouseEnter={() => setActiveIndex(index)}
                disabled={tool.status !== "live"}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors
                  ${index === activeIndex ? "bg-brand-50 dark:bg-slate-800" : ""}
                  ${tool.status !== "live" ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <span>
                  <span className="font-medium text-ink dark:text-slate-100">{tool.name}</span>
                  <span className="ml-2 text-xs text-ink-faint dark:text-slate-500">{tool.category}</span>
                </span>
                {tool.status !== "live" && <span className="text-[11px] text-ink-faint dark:text-slate-600">Soon</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
