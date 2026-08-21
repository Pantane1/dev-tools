"use client";

import { useState, useEffect } from "react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { apiPost, ApiError } from "@/lib/api";

interface MarkdownResponse {
  html: string;
}

const EXAMPLE = `# Pantane DevTools

**Fast**, *simple* utilities for developers.

- JSON Formatter
- JWT Decoder
- Hash Generator

> Built server-side, sanitized before it ever reaches your browser.
`;

export default function MarkdownPreviewPage() {
  const [input, setInput] = useState(EXAMPLE);
  const [html, setHtml] = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!input.trim()) {
        setHtml("");
        return;
      }
      try {
        const res = await apiPost<MarkdownResponse>("/markdown/preview", { content: input });
        setHtml(res.html);
      } catch (err) {
        if (err instanceof ApiError) setHtml("");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <ToolHeader name="Markdown Preview" description="Preview rendered Markdown side by side with the source — updates as you type." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ToolPanel title="Markdown">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={18}
            className="w-full resize-none rounded-lg border border-border bg-surface-subtle p-3 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
        </ToolPanel>

        <ToolPanel title="Preview">
          <div
            className="prose prose-sm max-w-none rounded-lg bg-surface-subtle p-3 text-ink dark:bg-slate-950 dark:text-slate-100 [&_a]:text-brand-600 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-ink-muted [&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_table]:w-full [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </ToolPanel>
      </div>
    </div>
  );
}