import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline",
  description: "You are offline. Some tools work offline once visited.",
};

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-ink dark:text-slate-100">You&apos;re offline</h1>
      <p className="mt-3 text-sm text-ink-muted dark:text-slate-400">
        Pantane DevTools needs a connection for network tools. Client-side tools (Bcrypt, Session Secret, Cron, Diff, Color, chmod) still work if you&apos;ve visited them before.
      </p>
    </div>
  );
}