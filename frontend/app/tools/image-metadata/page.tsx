"use client";

import { useState, useRef } from "react";
import { Upload, AlertTriangle } from "lucide-react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { ErrorMessage } from "@/components/ErrorMessage";
import { apiPostFormData, ApiError } from "@/lib/api";

interface ImageMetadataResponse {
  filename: string;
  format: string;
  width: number;
  height: number;
  mode: string;
  size_bytes: number;
  exif: Record<string, string>;
  has_gps_data: boolean;
}

export default function ImageMetadataPage() {
  const [result, setResult] = useState<ImageMetadataResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiPostFormData<ImageMetadataResponse>("/image-metadata/extract", formData);
      setResult(res);
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ToolHeader name="Image Metadata Viewer" description="Inspect EXIF and other metadata embedded in an image." />

      <ToolPanel title="Image" className="mb-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border py-10 text-ink-muted transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400"
        >
          <Upload size={20} />
          <span className="text-sm font-medium">Click to upload an image</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </ToolPanel>

      {error && <ErrorMessage message={error} />}

      {!error && result && (
        <div className="space-y-4">
          {result.has_gps_data && (
            <div className="flex items-start gap-2 rounded-lg border border-warn-500/30 bg-warn-50 px-3.5 py-3 text-sm text-warn-600 dark:border-warn-500/30 dark:bg-warn-500/10 dark:text-amber-400">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>This image contains GPS location data. Be careful before sharing it publicly.</span>
            </div>
          )}

          <ToolPanel title="Image details">
            <div className="flex gap-4">
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Uploaded preview" className="h-24 w-24 shrink-0 rounded-lg border border-border object-cover dark:border-slate-800" />
              )}
              <dl className="flex-1 space-y-2 text-sm">
                <Row label="Filename" value={result.filename} />
                <Row label="Format" value={result.format} />
                <Row label="Dimensions" value={`${result.width} × ${result.height}`} />
                <Row label="Color mode" value={result.mode} />
                <Row label="File size" value={`${(result.size_bytes / 1024).toFixed(1)} KB`} />
              </dl>
            </div>
          </ToolPanel>

          {Object.keys(result.exif).length > 0 && (
            <ToolPanel title={`EXIF data (${Object.keys(result.exif).length} tags)`}>
              <dl className="space-y-1.5 text-xs">
                {Object.entries(result.exif).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <dt className="text-ink-faint dark:text-slate-500">{key}</dt>
                    <dd className="max-w-[60%] truncate text-right font-mono text-ink dark:text-slate-300">{value}</dd>
                  </div>
                ))}
              </dl>
            </ToolPanel>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-faint dark:text-slate-500">{label}</dt>
      <dd className="text-right text-ink dark:text-slate-200">{value}</dd>
    </div>
  );
}