"use client";

import { useState } from "react";
import * as bcrypt from "bcryptjs";
import { ShieldCheck, RefreshCw, Check, X } from "lucide-react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { CopyButton } from "@/components/CopyButton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingState } from "@/components/LoadingState";

type Mode = "hash" | "verify";

export default function BcryptPage() {
  const [mode, setMode] = useState<Mode>("hash");
  const [password, setPassword] = useState("");
  const [rounds, setRounds] = useState(12);
  const [hash, setHash] = useState("");
  const [verifyHash, setVerifyHash] = useState("");
  const [resultHash, setResultHash] = useState("");
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleHash() {
    setError(null);
    setResultHash("");
    if (!password) {
      setError("Enter a password to hash.");
      return;
    }
    setLoading(true);
    try {
      // bcrypt.hash is synchronous in bcryptjs; wrap in setTimeout to keep UI responsive
      await new Promise((resolve) => setTimeout(resolve, 0));
      const h = bcrypt.hashSync(password, rounds);
      setResultHash(h);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to hash.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setError(null);
    setVerifyResult(null);
    if (!password || !verifyHash) {
      setError("Enter both a password and a hash.");
      return;
    }
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 0));
      const ok = bcrypt.compareSync(password, verifyHash);
      setVerifyResult(ok);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to verify.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ToolHeader name="Bcrypt Password Hash Generator" description="Generate and verify bcrypt hashes entirely in your browser." />

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger-500/30 bg-danger-50 px-3.5 py-3 text-sm text-danger-600 dark:border-danger-500/40 dark:bg-danger-500/10 dark:text-red-400">
        <ShieldCheck size={16} className="mt-0.5 shrink-0" />
        <span>
          <strong>Client-side only.</strong> Never enter real production passwords into online tools. Hashes are computed in your browser and never sent anywhere.
        </span>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => { setMode("hash"); setError(null); }}
          className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
            mode === "hash" ? "bg-brand-600 text-white" : "border border-border text-ink-muted hover:bg-surface-subtle dark:border-slate-700 dark:text-slate-400"
          }`}
        >
          Hash
        </button>
        <button
          type="button"
          onClick={() => { setMode("verify"); setError(null); }}
          className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
            mode === "verify" ? "bg-brand-600 text-white" : "border border-border text-ink-muted hover:bg-surface-subtle dark:border-slate-700 dark:text-slate-400"
          }`}
        >
          Verify
        </button>
      </div>

      <ToolPanel title="Input" className="mb-4">
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint dark:text-slate-500">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Password"
          className="w-full rounded-lg border border-border bg-surface-subtle px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
        />

        {mode === "hash" && (
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <label htmlFor="rounds" className="font-medium text-ink dark:text-slate-200">Cost factor (salt rounds)</label>
              <span className="font-mono text-ink-muted dark:text-slate-400">{rounds}</span>
            </div>
            <input
              id="rounds"
              type="range"
              min={4}
              max={14}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
            <p className="mt-1 text-xs text-ink-faint dark:text-slate-500">Higher = slower &amp; more secure. 10–12 recommended.</p>
          </div>
        )}

        {mode === "verify" && (
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint dark:text-slate-500">Existing hash</label>
            <textarea
              value={verifyHash}
              onChange={(e) => setVerifyHash(e.target.value)}
              aria-label="Existing bcrypt hash"
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-surface-subtle p-3 font-mono text-xs text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
        )}

        <button
          type="button"
          onClick={mode === "hash" ? handleHash : handleVerify}
          disabled={loading}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {mode === "hash" ? "Generate hash" : "Verify"}
        </button>
      </ToolPanel>

      {loading && <LoadingState label={mode === "hash" ? "Hashing…" : "Verifying…"} />}

      {!loading && error && <ErrorMessage message={error} />}

      {!loading && mode === "hash" && resultHash && (
        <ToolPanel title="Bcrypt hash" actions={<CopyButton value={resultHash} />}>
          <pre className="overflow-auto rounded-lg bg-surface-subtle p-3 font-mono text-sm text-ink dark:bg-slate-950 dark:text-slate-100">
            {resultHash}
          </pre>
        </ToolPanel>
      )}

      {!loading && mode === "verify" && verifyResult !== null && (
        <ToolPanel title="Result">
          <div className={`flex items-center gap-2 text-sm font-medium ${verifyResult ? "text-accent-600" : "text-danger-600 dark:text-red-400"}`}>
            {verifyResult ? <Check size={16} /> : <X size={16} />}
            {verifyResult ? "Password matches the hash." : "Password does NOT match the hash."}
          </div>
        </ToolPanel>
      )}
    </div>
  );
}