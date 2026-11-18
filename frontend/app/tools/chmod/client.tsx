"use client";

import { useState, useMemo } from "react";
import { Shield, Copy, Check } from "lucide-react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { CopyButton } from "@/components/CopyButton";

const ROLES = ["Owner", "Group", "Others"] as const;
const PERMS = ["r", "w", "x"] as const;

type Matrix = boolean[][]; // [role][perm]

function matrixToOctal(m: Matrix): string {
  return m
    .map((row) => {
      let v = 0;
      if (row[0]) v += 4;
      if (row[1]) v += 2;
      if (row[2]) v += 1;
      return v.toString();
    })
    .join("");
}

function matrixToSymbolic(m: Matrix): string {
  return m
    .map((row) => PERMS.map((_, i) => (row[i] ? PERMS[i] : "-")).join(""))
    .join("");
}

function octalToMatrix(octal: string): Matrix | null {
  if (!/^[0-7]{3}$/.test(octal)) return null;
  return octal.split("").map((d) => {
    const v = parseInt(d, 8);
    return [!!(v & 4), !!(v & 2), !!(v & 1)];
  });
}

const PRESETS = [
  { label: "755 (rwxr-xr-x)", value: "755" },
  { label: "644 (rw-r--r--)", value: "644" },
  { label: "600 (rw-------)", value: "600" },
  { label: "777 (rwxrwxrwx)", value: "777" },
  { label: "700 (rwx------)", value: "700" },
  { label: "666 (rw-rw-rw-)", value: "666" },
];

export default function ChmodPage() {
  const [octal, setOctal] = useState("755");
  const [matrix, setMatrix] = useState<Matrix>(() => octalToMatrix("755")!);

  const symbolic = useMemo(() => matrixToSymbolic(matrix), [matrix]);
  const computedOctal = useMemo(() => matrixToOctal(matrix), [matrix]);

  function toggle(role: number, perm: number) {
    setMatrix((prev) => {
      const next = prev.map((row) => [...row]);
      next[role]![perm] = !next[role]![perm];
      return next;
    });
  }

  function applyOctal(value: string) {
    setOctal(value);
    const m = octalToMatrix(value);
    if (m) setMatrix(m);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ToolHeader name="Unix chmod Calculator" description="Convert between octal and symbolic Unix file permissions." />

      <ToolPanel title="Permission matrix" className="mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-ink-faint dark:text-slate-500">
                <th className="pb-2 text-left font-medium"></th>
                {PERMS.map((p) => (
                  <th key={p} className="pb-2 text-center font-mono">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role, ri) => (
                <tr key={role}>
                  <td className="py-1.5 font-medium text-ink dark:text-slate-200">{role}</td>
                  {PERMS.map((p, pi) => (
                    <td key={p} className="py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={matrix[ri]![pi]!}
                        onChange={() => toggle(ri, pi)}
                        aria-label={`${role} ${p}`}
                        className="h-4 w-4 accent-brand-600"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint dark:text-slate-500">Octal</label>
            <input
              value={octal}
              onChange={(e) => applyOctal(e.target.value)}
              aria-label="Octal permission"
              placeholder="755"
              maxLength={3}
              className="w-full rounded-lg border border-border bg-surface-subtle px-3 py-2 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
            {octal !== computedOctal && (
              <p className="mt-1 text-xs text-warn-600 dark:text-amber-400">Computed: {computedOctal}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint dark:text-slate-500">Symbolic</label>
            <div className="rounded-lg border border-border bg-surface-subtle px-3 py-2 font-mono text-sm text-ink dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
              {symbolic}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {PRESETS.map((pr) => (
            <button
              key={pr.value}
              type="button"
              onClick={() => applyOctal(pr.value)}
              className="rounded-full border border-border px-2.5 py-1 text-xs font-mono text-ink-muted hover:bg-surface-subtle dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              {pr.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <CopyButton value={`chmod ${computedOctal} <file>`} />
        </div>
      </ToolPanel>
    </div>
  );
}