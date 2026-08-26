"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { ErrorMessage } from "@/components/ErrorMessage";
import { apiPost, ApiError } from "@/lib/api";

type QrType = "text" | "url" | "wifi" | "email" | "phone";

interface QrResponse {
  image_base64: string;
}

export default function QrGeneratorPage() {
  const [type, setType] = useState<QrType>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [size, setSize] = useState(300);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function buildContent(): string {
    switch (type) {
      case "url":
        return url.startsWith("http") ? url : `https://${url}`;
      case "wifi":
        return `WIFI:T:WPA;S:${ssid};P:${password};;`;
      case "email":
        return `mailto:${email}`;
      case "phone":
        return `tel:${phone}`;
      default:
        return text;
    }
  }

  async function generate() {
    setError(null);
    const content = buildContent();
    if (!content.trim()) return;
    try {
      const res = await apiPost<QrResponse>("/qr/generate", { content, size, error_correction: "M" });
      setImage(res.image_base64);
    } catch (err) {
      setImage(null);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  function download() {
    if (!image) return;
    const link = document.createElement("a");
    link.href = image;
    link.download = "qrcode.png";
    link.click();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ToolHeader name="QR Code Generator" description="Generate a QR code from text, a URL, Wi-Fi credentials, an email, or a phone number." />

      <ToolPanel title="Content" className="mb-4">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {(["text", "url", "wifi", "email", "phone"] as QrType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                type === t ? "border-brand-600 bg-brand-600 text-white" : "border-border text-ink-muted hover:bg-surface-subtle dark:border-slate-700 dark:text-slate-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {type === "text" && <Field value={text} onChange={setText} placeholder="Any text" />}
        {type === "url" && <Field value={url} onChange={setUrl} placeholder="example.com" />}
        {type === "wifi" && (
          <div className="space-y-2">
            <Field value={ssid} onChange={setSsid} placeholder="Wi-Fi network name (SSID)" />
            <Field value={password} onChange={setPassword} placeholder="Wi-Fi password" />
          </div>
        )}
        {type === "email" && <Field value={email} onChange={setEmail} placeholder="someone@example.com" />}
        {type === "phone" && <Field value={phone} onChange={setPhone} placeholder="+254712345678" />}

        <div className="mt-3 flex items-center gap-3">
          <label htmlFor="qr-size" className="text-xs text-ink-faint dark:text-slate-500">Size</label>
          <input id="qr-size" type="range" min={150} max={600} value={size} onChange={(e) => setSize(Number(e.target.value))} className="flex-1 accent-brand-600" />
          <span className="w-16 text-right font-mono text-xs text-ink-muted dark:text-slate-400">{size}px</span>
        </div>

        <button type="button" onClick={generate} className="mt-4 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Generate
        </button>
      </ToolPanel>

      {error && <ErrorMessage message={error} />}

      {!error && image && (
        <ToolPanel title="QR Code">
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Generated QR code" loading="lazy" className="rounded-lg border border-border dark:border-slate-800" style={{ width: size, height: size }} />
            <button
              type="button"
              onClick={download}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-ink-muted hover:bg-surface-subtle dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              <Download size={14} />
              Download PNG
            </button>
          </div>
        </ToolPanel>
      )}
    </div>
  );
}

function Field({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full rounded-lg border border-border bg-surface-subtle px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
    />
  );
}
