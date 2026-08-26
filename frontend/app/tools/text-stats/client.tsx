"use client";

import { useState, useEffect } from "react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { apiPost, ApiError } from "@/lib/api";

interface TextStatsResponse {
  characters: number;
  characters_no_spaces: number;
  words: number;
  lines: number;
  sentences: number;
  reading_time_seconds: number;
}

export default function TextStatsPage() {
  const [input, setInput] = useState("");
  const [stats, setStats] = useState<TextStatsResponse | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!input) {
        setStats(null);
        return;
      }
      try {
        const res = await apiPost<TextStatsResponse>("/text-stats/analyze", { content: input });
        setStats(res);
      } catch (err) {
        if (err instanceof ApiError) setStats(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  function formatReadingTime(seconds: number) {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const rem = seconds % 60;
    return rem ? `${mins}m ${rem}s` : `${mins}m`;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ToolHeader name="Text Statistics" description="Count characters, words, lines and sentences, and estimate reading time — updates as you type." />

      <ToolPanel title="Text" className="mb-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          aria-label="Text to analyze"
          placeholder="Paste or type text…"
          className="w-full resize-none rounded-lg border border-border bg-surface-subtle p-3 text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
        />
      </ToolPanel>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Characters" value={stats?.characters ?? 0} />
        <Stat label="Characters (no spaces)" value={stats?.characters_no_spaces ?? 0} />
        <Stat label="Words" value={stats?.words ?? 0} />
        <Stat label="Lines" value={stats?.lines ?? 0} />
        <Stat label="Sentences" value={stats?.sentences ?? 0} />
        <Stat label="Reading time" value={formatReadingTime(stats?.reading_time_seconds ?? 0)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3.5 text-center dark:border-slate-800 dark:bg-slate-900">
      <p className="text-2xl font-semibold text-ink dark:text-slate-100">{value}</p>
      <p className="mt-1 text-xs text-ink-faint dark:text-slate-500">{label}</p>
    </div>
  );
}
