"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { CopyButton } from "@/components/CopyButton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingState } from "@/components/LoadingState";
import { apiPost, ApiError } from "@/lib/api";

const EXAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlBhbnRhbmUiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTgwMDAwMDAwMH0.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ";

interface JwtResponse {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  algorithm: string | null;
  issuer: string | null;
  subject: string | null;
  issued_at: string | null;
  expires_at: string | null;
  expiry: { status: "VALID" | "EXPIRED" | "NO_EXPIRY"; detail: string };
  note: string;
}

export default function JwtDecoderPage() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<JwtResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function decode() {
    setError(null);
    setResult(null);
    if (!token.trim()) return;
    setLoading(true);
    try {
      const res = await apiPost<JwtResponse>("/jwt/decode", { token: token.trim() });
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const statusStyles = {
    VALID: "bg-accent-50 text-accent-600 border-accent-500/30 dark:bg-accent-500/10",
    EXPIRED: "bg-danger-50 text-danger-600 border-danger-500/30 dark:bg-danger-500/10 dark:text-red-400",
    NO_EXPIRY: "bg-warn-50 text-warn-600 border-warn-500/30 dark:bg-warn-500/10 dark:text-amber-400",
  } as const;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <ToolHeader name="JWT Decoder" description="Decode a JWT's header and payload, and check its expiry." />

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-warn-500/30 bg-warn-50 px-3.5 py-3 text-sm text-warn-600 dark:border-warn-500/30 dark:bg-warn-500/10 dark:text-amber-400">
        <ShieldAlert size={16} className="mt-0.5 shrink-0" />
        <span>This only decodes the token — it does not verify the signature. Never paste a token you don&apos;t trust.</span>
      </div>

      <ToolPanel
        title="Token"
        actions={
          <>
            <button type="button" onClick={() => setToken(EXAMPLE)} className="text-xs font-medium text-brand-600 hover:text-brand-700">
              Load example
            </button>
            <button
              type="button"
              onClick={() => {
                setToken("");
                setResult(null);
                setError(null);
              }}
              className="text-xs font-medium text-ink-faint hover:text-ink-muted dark:hover:text-slate-400"
            >
              Clear
            </button>
          </>
        }
        className="mb-4"
      >
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOi..."
          rows={4}
          className="w-full resize-none break-all rounded-lg border border-border bg-surface-subtle p-3 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
        />
        <button
          type="button"
          onClick={decode}
          className="mt-3 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Decode
        </button>
      </ToolPanel>

      {loading && <LoadingState label="Decoding…" />}
      {!loading && error && <ErrorMessage message={error} />}

      {!loading && result && (
        <div className="space-y-4">
          <div className={`flex items-center justify-between rounded-lg border px-3.5 py-3 text-sm font-medium ${statusStyles[result.expiry.status]}`}>
            <span>{result.expiry.status.replace("_", " ")}</span>
            <span className="font-normal">{result.expiry.detail}</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface-subtle p-3 text-sm dark:border-slate-800 dark:bg-slate-950">
              <dl className="space-y-1.5">
                <Row label="Algorithm" value={result.algorithm ?? "—"} />
                <Row label="Issuer" value={result.issuer ?? "—"} />
                <Row label="Subject" value={result.subject ?? "—"} />
                <Row label="Issued at" value={result.issued_at ?? "—"} />
                <Row label="Expires at" value={result.expires_at ?? "—"} />
              </dl>
            </div>
            <div className="rounded-lg border border-border bg-surface-subtle p-3 text-xs text-ink-faint dark:border-slate-800 dark:bg-slate-950 dark:text-slate-500">
              {result.note}
              <p className="mt-2 font-medium uppercase tracking-wide text-ink-faint dark:text-slate-500">Signature verification</p>
              <p className="mt-1">Not performed — this tool never has the signing key for a token you paste in.</p>
            </div>
          </div>

          <ToolPanel title="Header" actions={<CopyButton value={JSON.stringify(result.header, null, 2)} />}>
            <pre className="overflow-auto rounded-lg bg-surface-subtle p-3 font-mono text-sm text-ink dark:bg-slate-950 dark:text-slate-100">
              {JSON.stringify(result.header, null, 2)}
            </pre>
          </ToolPanel>

          <ToolPanel title="Payload" actions={<CopyButton value={JSON.stringify(result.payload, null, 2)} />}>
            <pre className="overflow-auto rounded-lg bg-surface-subtle p-3 font-mono text-sm text-ink dark:bg-slate-950 dark:text-slate-100">
              {JSON.stringify(result.payload, null, 2)}
            </pre>
          </ToolPanel>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-faint dark:text-slate-500">{label}</dt>
      <dd className="text-right font-mono text-ink dark:text-slate-200">{value}</dd>
    </div>
  );
}
