import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ToolCard } from "@/components/ToolCard";
import { LIVE_TOOLS, TOOLS } from "@/lib/tools-data";

export default function HomePage() {
  const popular = TOOLS.filter((t) =>
    ["json", "jwt", "hash", "api-tester", "regex", "qr"].includes(t.slug)
  );

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="flex flex-col items-center py-20 text-center sm:py-28">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs font-medium text-ink-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          {LIVE_TOOLS.length} tools live · more shipping soon
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl dark:text-slate-100">
          Pantane DevTools
        </h1>
        <p className="mt-3 text-lg text-ink-muted dark:text-slate-400">Your everyday developer toolbox.</p>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-muted dark:text-slate-500">
          Fast, simple utilities for developers, students, sysadmins and security enthusiasts.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Explore tools
            <ArrowRight size={15} />
          </Link>
          <span className="text-xs text-ink-faint dark:text-slate-600">
            or press <kbd className="kbd">⌘K</kbd> to search
          </span>
        </div>
      </section>

      {/* Popular tools */}
      <section className="pb-24">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-ink dark:text-slate-100">Popular tools</h2>
          <Link href="/tools" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>
    </div>
  );
}
