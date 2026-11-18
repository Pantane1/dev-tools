"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari detection
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/chrome|crios|fxios/.test(ua);
    if (isIos && isSafari) setShowIosHint(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (isStandalone || installed) return null;

  async function handleInstall() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
      setDeferred(null);
    }
  }

  if (deferred) {
    return (
      <button
        type="button"
        onClick={handleInstall}
        aria-label="Install app"
        className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface-subtle px-3 text-sm text-ink-muted transition-colors hover:text-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500 dark:hover:text-slate-300"
      >
        <Download size={14} />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  if (showIosHint) {
    return (
      <button
        type="button"
        onClick={() => setShowIosHint(false)}
        aria-label="Install hint"
        title="Tap Share → Add to Home Screen"
        className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface-subtle px-3 text-sm text-ink-muted transition-colors hover:text-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500 dark:hover:text-slate-300"
      >
        <Download size={14} />
        <span className="hidden sm:inline">Install</span>
      </button>
    );
  }

  return null;
}