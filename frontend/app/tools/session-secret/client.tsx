"use client";

import { useState } from "react";
import { RefreshCw, Copy, Check } from "lucide-react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { CopyButton } from "@/components/CopyButton";
import { DownloadButton } from "@/components/DownloadButton";

import { generateSecret } from "@/lib/session-secret";
type Format = "hex" | "base64" | "base64url";

const BYTE_PRESETS = [16, 32, 64, 128] as const;
const COUNT_PRESETS = [1, 5, 10] as const;

export default function SessionSecretPage() {
  const [byteLength, setByteLength] = useState<number>(32);
  const [format, setFormat] = useState<Format>("hex");
  const [count, setCount] = useState<number>(1);
  const [secrets, setSecrets] = useState<string[]>([]);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  function generate() {
    const next: string[] = [];
    for (let i = 0; i < count; i++) {
      next.push(generateSecret(byteLength, format));
    }
    setSecrets(next);
  }

  const joined = secrets.join("\n");
  const snippet = secrets.length
    ? secrets.map((s, i) => (secrets.length > 1 ? `SESSION_SECRET_${i + 1}=${s}` : `SESSION_SECRET=${s}`)).join("\n")
    : "";

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ToolHeader
        name="Session Secret Generator"
        description="Generate cryptographically secure session secrets and signing keys — 100% client-side, never leaves your browser."
      />

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-warn-500/30 bg-warn-50 px-3.5 py-3 text-sm text-warn-600 dark:border-warn-500/30 dark:bg-warn-500/10 dark:text-amber-400">
        <span>Uses your browser&apos;s CSPRNG (Web Crypto). Secrets are generated locally and never sent to any server.</span>
      </div>

      <ToolPanel title="Options" className="mb-4">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint dark:text-slate-500">Byte length</p>
            <div className="flex flex-wrap gap-1.5">
              {BYTE_PRESETS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setByteLength(b)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    byteLength === b
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-border text-ink-muted hover:bg-surface-subtle dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint dark:text-slate-500">Format</p>
            <div className="flex flex-wrap gap-1.5">
              {(["hex", "base64", "base64url"] as Format[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    format === f
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-border text-ink-muted hover:bg-surface-subtle dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint dark:text-slate-500">How many</p>
            <div className="flex flex-wrap gap-1.5">
              {COUNT_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCount(c)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    count === c
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-border text-ink-muted hover:bg-surface-subtle dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={generate}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <RefreshCw size={14} />
          Generate
        </button>
      </ToolPanel>

      {secrets.length > 0 && (
        <ToolPanel
          title={`${secrets.length} secret${secrets.length > 1 ? "s" : ""}`}
          actions={
            <>
              <CopyButton value={joined} />
              <DownloadButton value={joined} filename="session-secrets.txt" />
              <button
                type="button"
                onClick={copySnippet}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-subtle hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                {copiedSnippet ? <Check size={14} className="text-accent-600" /> : <Copy size={14} />}
                {copiedSnippet ? "Copied snippet" : ".env snippet"}
              </button>
            </>
          }
        >
          <pre className="max-h-96 overflow-auto rounded-lg bg-surface-subtle p-3 font-mono text-sm text-ink dark:bg-slate-950 dark:text-slate-100">
            {joined}
          </pre>
          {snippet && (
            <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-surface-muted p-3 font-mono text-xs text-ink-muted dark:bg-slate-900 dark:text-slate-400">
              {snippet}
            </pre>
          )}
        </ToolPanel>
      )}
    </div>
  );
}