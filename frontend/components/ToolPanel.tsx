import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Standard two-pane (input / output) container every tool page uses,
 * so tools feel like one consistent product rather than separate forms.
 */
export function ToolPanel({
  title,
  actions,
  children,
  className,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface shadow-card dark:border-slate-800 dark:bg-slate-900", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 dark:border-slate-800">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint dark:text-slate-500">{title}</span>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
