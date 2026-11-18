import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border py-8 dark:border-slate-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-ink-faint sm:flex-row dark:text-slate-600">
        <p>Pantane DevTools — built by Pantane.</p>
        <div className="flex items-center gap-3">
          <Link
            href="https://www.pantane.is-a.dev"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-ink-muted dark:hover:text-slate-400"
          >
            ← Pantane Hub
          </Link>
          <p>Tools run server-side. Nothing you process is stored.</p>
        </div>
      </div>
    </footer>
  );
}
