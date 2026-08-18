import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Processing…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 px-1 py-3 text-sm text-ink-muted dark:text-slate-400">
      <Loader2 size={14} className="animate-spin" />
      {label}
    </div>
  );
}
