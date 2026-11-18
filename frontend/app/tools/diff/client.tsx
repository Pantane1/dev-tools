"use client";

import { useState } from "react";
import { GitCompare } from "lucide-react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { CopyButton } from "@/components/CopyButton";
import { diffLines, type DiffLine } from "@/lib/diff";

const EXAMPLE_A = "function greet(name) {\n  return \"Hello, \" + name;\n}\n";
const EXAMPLE_B = "function greet(name) {\n  if (!name) return \"Hello, stranger\";\n  return \"Hello, \" + name;\n}\n";

export default function DiffPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [diff, setDiff] = useState<DiffLine[] | null>(null);

  function compare() {
    setDiff(diffLines(left.split("\n"), right.split("\n")));
  }

  const added = diff?.filter((d) => d.type === "add").length ?? 0;
  const removed = diff?.filter((d) => d.type === "del").length ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <ToolHeader name="Text Diff Checker" description="Compare two texts line by line and see additions, removals and unchanged lines." />

      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => { setLeft(EXAMPLE_A); setRight(EXAMPLE_B); setDiff(null); }}
          className="text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          Load example
        </button>
        <button
          type="button"
          onClick={() => { setLeft(""); setRight(""); setDiff(null); }}
          className="text-xs font-medium text-ink-faint hover:text-ink-muted dark:hover:text-slate-400"
        >
          Clear
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ToolPanel title="Original">
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            aria-label="Original text"
            rows={12}
            className="w-full resize-none rounded-lg border border-border bg-surface-subtle p-3 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
        </ToolPanel>
        <ToolPanel title="Modified">
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            aria-label="Modified text"
            rows={12}
            className="w-full resize-none rounded-lg border border-border bg-surface-subtle p-3 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
        </ToolPanel>
      </div>

      <button
        type="button"
        onClick={compare}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        <GitCompare size={14} />
        Compare
      </button>

      {diff && (
        <ToolPanel
          title={`Diff — +${added} / -${removed}`}
          actions={<CopyButton value={diff.map((d) => (d.type === "add" ? "+ " : d.type === "del" ? "- " : "  ") + d.text).join("\n")} />}
          className="mt-4"
        >
          <pre className="max-h-[32rem] overflow-auto rounded-lg bg-surface-subtle p-3 font-mono text-sm dark:bg-slate-950">
            {diff.map((d, i) => (
              <div
                key={i}
                className={
                  d.type === "add"
                    ? "bg-accent-50 text-accent-600 dark:bg-accent-500/10"
                    : d.type === "del"
                    ? "bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-red-400"
                    : "text-ink dark:text-slate-300"
                }
              >
                {d.type === "add" ? "+ " : d.type === "del" ? "- " : "  "}
                {d.text || " "}
              </div>
            ))}
          </pre>
        </ToolPanel>
      )}
    </div>
  );
}