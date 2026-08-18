"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ToolCard } from "@/components/ToolCard";
import { CATEGORIES, TOOLS } from "@/lib/tools-data";
import type { ToolCategory } from "@/types/tools";

export default function ToolsDirectoryPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "All">("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((t) => {
      const matchesCategory = activeCategory === "All" || t.category === activeCategory;
      const matchesQuery =
        !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.keywords.some((k) => k.includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink dark:text-slate-100">All tools</h1>
        <p className="mt-1.5 text-sm text-ink-muted dark:text-slate-400">
          Browse every tool in Pantane DevTools, organized by category.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 sm:w-72 dark:border-slate-800 dark:bg-slate-900">
          <Search size={15} className="text-ink-faint dark:text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint dark:text-slate-100 dark:placeholder:text-slate-600"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(["All", ...CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-border text-ink-muted hover:bg-surface-subtle dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-faint dark:text-slate-500">No tools match your search.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
