"use client";

import { useState } from "react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { ErrorMessage } from "@/components/ErrorMessage";
import { apiPost, ApiError } from "@/lib/api";

interface RegexMatch {
  match: string;
  start: number;
  end: number;
  groups: (string | null)[];
}
interface RegexTestResponse {
  matches: RegexMatch[];
  count: number;
}

const FLAGS: { id: string; label: string }[] = [
  { id: "i", label: "Case-insensitive" },
  { id: "m", label: "Multiline" },
  { id: "s", label: "Dot matches newline" },
];

export default function RegexPage() {
  const [pattern, setPattern] = useState("");
  const [text, setText] = useState("");
  const [flags, setFlags] = useState<string[]>([]);
  const [result, setResult] = useState<RegexTestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleFlag(id: string) {
    setFlags((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }

  async function run() {
    setError(null);
    if (!pattern.trim()) {
      setResult(null);
      return;
    }
    try {
      const res = await apiPost<RegexTestResponse>("/regex/test", { pattern, test_text: text, flags });
      setResult(res);
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  function highlighted() {
    if (!result || result.matches.length === 0) return text;
    const parts: React.ReactNode[] = [];
    let cursor = 0;
    result.matches.forEach((m, i) => {
      parts.push(text.slice(cursor, m.start));
      parts.push(
        <mark key={i} className="rounded bg-brand-100 px-0.5 text-ink dark:bg-brand-500/30 dark:text-slate-100">
          {text.slice(m.start, m.end)}
        </mark>
      );
      cursor = m.end;
    });
    parts.push(text.slice(cursor));
    return parts;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ToolHeader name="Regex Tester" description="Test a regular expression against sample text, with match highlighting and groups." />

      <ToolPanel title="Pattern" className="mb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-ink-faint dark:text-slate-500">/</span>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            onBlur={run}
            placeholder="\d+"
            className="flex-1 rounded-lg border border-border bg-surface-subtle px-3 py-2 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
          <span className="font-mono text-ink-faint dark:text-slate-500">/{flags.join("")}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          {FLAGS.map((f) => (
            <label key={f.id} className="flex items-center gap-1.5 text-ink-muted dark:text-slate-400">
              <input type="checkbox" checked={flags.includes(f.id)} onChange={() => { toggleFlag(f.id); }} className="h-4 w-4 accent-brand-600" />
              {f.label}
            </label>
          ))}
        </div>
      </ToolPanel>

      <ToolPanel title="Test text" className="mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={run}
          rows={6}
          placeholder="Paste text to test against…"
          className="w-full resize-none rounded-lg border border-border bg-surface-subtle p-3 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
        />
        <button type="button" onClick={run} className="mt-3 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Test
        </button>
      </ToolPanel>

      {error && <ErrorMessage message={error} />}

      {!error && result && (
        <ToolPanel title={`${result.count} match${result.count === 1 ? "" : "es"}`}>
          <div className="mb-3 whitespace-pre-wrap break-all rounded-lg bg-surface-subtle p-3 font-mono text-sm text-ink dark:bg-slate-950 dark:text-slate-100">
            {highlighted()}
          </div>
          {result.matches.length > 0 && (
            <div className="space-y-1.5">
              {result.matches.map((m, i) => (
                <div key={i} className="rounded-lg border border-border px-3 py-2 text-xs font-mono dark:border-slate-800">
                  <span className="text-ink-faint dark:text-slate-500">[{m.start}-{m.end}]</span>{" "}
                  <span className="text-ink dark:text-slate-200">{m.match}</span>
                  {m.groups.length > 0 && (
                    <span className="ml-2 text-ink-faint dark:text-slate-500">groups: {JSON.stringify(m.groups)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </ToolPanel>
      )}
    </div>
  );
}