"use client";

import { useState } from "react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { CopyButton } from "@/components/CopyButton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { apiPost, ApiError } from "@/lib/api";

interface YamlJsonResponse {
  result: string;
}

export default function YamlJsonPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<"yaml_to_json" | "json_to_yaml">("yaml_to_json");
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      const res = await apiPost<YamlJsonResponse>("/yaml-json/convert", { content: input, direction });
      setOutput(res.result);
    } catch (err) {
      setOutput("");
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  function swap() {
    setDirection((d) => (d === "yaml_to_json" ? "json_to_yaml" : "yaml_to_json"));
    setInput(output);
    setOutput(input);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <ToolHeader name="YAML ↔ JSON Converter" description="Convert between YAML and JSON." />

      <div className="mb-4 flex items-center gap-3">
        <div className="flex overflow-hidden rounded-lg border border-border dark:border-slate-700">
          <button
            type="button"
            onClick={() => setDirection("yaml_to_json")}
            className={`px-3.5 py-2 text-sm font-medium ${direction === "yaml_to_json" ? "bg-brand-600 text-white" : "text-ink-muted hover:bg-surface-subtle dark:text-slate-400"}`}
          >
            YAML → JSON
          </button>
          <button
            type="button"
            onClick={() => setDirection("json_to_yaml")}
            className={`px-3.5 py-2 text-sm font-medium ${direction === "json_to_yaml" ? "bg-brand-600 text-white" : "text-ink-muted hover:bg-surface-subtle dark:text-slate-400"}`}
          >
            JSON → YAML
          </button>
        </div>
        <button type="button" onClick={swap} className="text-xs font-medium text-brand-600 hover:text-brand-700">
          Swap input/output
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ToolPanel title={direction === "yaml_to_json" ? "YAML" : "JSON"}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={run}
            rows={14}
            placeholder={direction === "yaml_to_json" ? "name: Pantane\nrole: developer" : '{"name": "Pantane"}'}
            className="w-full resize-none rounded-lg border border-border bg-surface-subtle p-3 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
          <button type="button" onClick={run} className="mt-3 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Convert
          </button>
        </ToolPanel>

        <ToolPanel title={direction === "yaml_to_json" ? "JSON" : "YAML"} actions={<CopyButton value={output} />}>
          {error ? (
            <ErrorMessage message={error} />
          ) : (
            <pre className="max-h-[26rem] overflow-auto rounded-lg bg-surface-subtle p-3 font-mono text-sm text-ink dark:bg-slate-950 dark:text-slate-100">
              {output || <span className="text-ink-faint dark:text-slate-600">Output will appear here.</span>}
            </pre>
          )}
        </ToolPanel>
      </div>
    </div>
  );
}