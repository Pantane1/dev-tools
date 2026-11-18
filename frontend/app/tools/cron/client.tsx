"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { CopyButton } from "@/components/CopyButton";
import { parseCron, nextRuns, explain } from "@/lib/cron";

const EXAMPLES = [
  "*/5 * * * *",
  "0 9 * * 1-5",
  "0 0 1 * *",
  "30 14 * * 0",
];

export default function CronPage() {
  const [expr, setExpr] = useState("*/5 * * * *");
  const [error, setError] = useState<string | null>(null);
  const [runs, setRuns] = useState<Date[]>([]);

  function compute() {
    setError(null);
    try {
      parseCron(expr);
      setRuns(nextRuns(expr, 5));
    } catch (e) {
      setRuns([]);
      setError(e instanceof Error ? e.message : "Invalid expression");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ToolHeader name="Cron Expression Generator" description="Validate, explain and preview the next runs of a cron expression." />

      <ToolPanel title="Expression" className="mb-4">
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          aria-label="Cron expression"
          placeholder="* * * * *"
          className="w-full rounded-lg border border-border bg-surface-subtle px-3 py-2 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={compute}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            <Clock size={14} />
            Compute
          </button>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => { setExpr(ex); setError(null); }}
              className="rounded-full border border-border px-2.5 py-1 text-xs font-mono text-ink-muted hover:bg-surface-subtle dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              {ex}
            </button>
          ))}
        </div>
        {error && <p className="mt-2 text-sm text-danger-600 dark:text-red-400">{error}</p>}
      </ToolPanel>

      {!error && (
        <ToolPanel title="Explanation" className="mb-4">
          <p className="text-sm text-ink dark:text-slate-200">{explain(expr)}</p>
        </ToolPanel>
      )}

      {runs.length > 0 && (
        <ToolPanel title="Next 5 runs" actions={<CopyButton value={runs.map((r) => r.toISOString()).join("\n")} />}>
          <ul className="space-y-1.5 font-mono text-sm text-ink dark:text-slate-200">
            {runs.map((r, i) => (
              <li key={i}>{r.toLocaleString()}</li>
            ))}
          </ul>
        </ToolPanel>
      )}
    </div>
  );
}