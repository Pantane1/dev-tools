import Link from "next/link";
import { ArrowUpRight, Lock } from "lucide-react";
import type { ToolMeta } from "@/types/tools";
import { cn } from "@/lib/utils";

export function ToolCard({ tool }: { tool: ToolMeta }) {
  const isLive = tool.status === "live";

  const content = (
    <div
      className={cn(
        "group flex h-full flex-col justify-between rounded-xl border border-border bg-surface p-4 shadow-card transition-all",
        "dark:border-slate-800 dark:bg-slate-900",
        isLive
          ? "hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-popover"
          : "opacity-70"
      )}
    >
      <div>
        <div className="mb-2 flex items-start justify-between">
          <h3 className="font-medium text-ink dark:text-slate-100">{tool.name}</h3>
          {isLive ? (
            <ArrowUpRight
              size={16}
              className="mt-0.5 shrink-0 text-ink-faint transition-colors group-hover:text-brand-600 dark:text-slate-600"
            />
          ) : (
            <Lock size={14} className="mt-1 shrink-0 text-ink-faint dark:text-slate-600" />
          )}
        </div>
        <p className="text-sm leading-relaxed text-ink-muted dark:text-slate-400">{tool.description}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint dark:text-slate-600">
          {tool.category}
        </span>
        {!isLive && (
          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-ink-muted dark:bg-slate-800 dark:text-slate-500">
            Coming soon
          </span>
        )}
      </div>
    </div>
  );

  if (!isLive) {
    return <div aria-disabled>{content}</div>;
  }

  return (
    <Link href={`/tools/${tool.slug}`} className="block h-full">
      {content}
    </Link>
  );
}
