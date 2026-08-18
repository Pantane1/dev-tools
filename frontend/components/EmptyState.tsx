import type { ReactNode } from "react";

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center dark:border-slate-700">
      <div className="mb-1 text-ink-faint dark:text-slate-600">{icon}</div>
      <p className="text-sm font-medium text-ink dark:text-slate-200">{title}</p>
      <p className="max-w-xs text-sm text-ink-muted dark:text-slate-500">{description}</p>
    </div>
  );
}
