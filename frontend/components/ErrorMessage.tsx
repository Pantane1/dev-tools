import { AlertTriangle } from "lucide-react";

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-danger-500/30 bg-danger-50 px-3.5 py-3 text-sm text-danger-600
        dark:border-danger-500/40 dark:bg-danger-500/10 dark:text-red-400"
    >
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
