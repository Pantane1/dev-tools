import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ToolHeader({ name, description }: { name: string; description: string }) {
  return (
    <div className="mb-6">
      <Link
        href="/tools"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowLeft size={14} />
        All tools
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight text-ink dark:text-slate-100">{name}</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-ink-muted dark:text-slate-400">{description}</p>
    </div>
  );
}
