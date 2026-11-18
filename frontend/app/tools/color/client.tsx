"use client";

import { useState, useMemo } from "react";
import { Palette, Copy, Check } from "lucide-react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { CopyButton } from "@/components/CopyButton";

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };
type OKLCH = { l: number; c: number; h: number };

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function hexToRgb(hex: string): RGB | null {
  const m = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(m)) return null;
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
      case gn: h = (bn - rn) / d + 2; break;
      case bn: h = (rn - gn) / d + 4; break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const sn = s / 100, ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// sRGB -> linear
function toLinear(v: number) {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function rgbToOklch({ r, g, b }: RGB): OKLCH {
  const rl = toLinear(r), gl = toLinear(g), bl = toLinear(b);
  // linear sRGB -> XYZ (D65)
  const x = 0.4124564 * rl + 0.3575761 * gl + 0.1804375 * bl;
  const y = 0.2126729 * rl + 0.7151522 * gl + 0.0721750 * bl;
  const z = 0.0193339 * rl + 0.1191920 * gl + 0.9503041 * bl;
  // XYZ -> Oklab
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const c = Math.sqrt(a * a + bb * bb);
  let h = (Math.atan2(bb, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h };
}

function oklchToRgb({ l, c, h }: OKLCH): RGB {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const bb = c * Math.sin(hr);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * bb;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * bb;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * bb;
  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;
  const x = 1.2270138511 * l3 - 0.5577999807 * m3 + 0.2812561490 * s3;
  const y = -0.0405801784 * l3 + 1.1122568696 * m3 - 0.0716766787 * s3;
  const z = -0.0763812845 * l3 - 0.4214819784 * m3 + 1.5718239485 * s3;
  // XYZ -> linear sRGB
  const rl = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  const gl = -0.9692660 * x + 1.8760108 * y + 0.0415560 * z;
  const bl = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;
  function toSrgb(c: number) {
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return clamp(Math.round(v * 255), 0, 255);
  }
  return { r: toSrgb(rl), g: toSrgb(gl), b: toSrgb(bl) };
}

function relativeLuminance({ r, g, b }: RGB): number {
  const R = toLinear(r), G = toLinear(g), B = toLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(a: RGB, b: RGB): number {
  const l1 = relativeLuminance(a), l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const EXAMPLE = "#2563eb";

export default function ColorPage() {
  const [hex, setHex] = useState(EXAMPLE);
  const [compareHex, setCompareHex] = useState("#ffffff");

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => (rgb ? rgbToHsl(rgb) : null), [rgb]);
  const oklch = useMemo(() => (rgb ? rgbToOklch(rgb) : null), [rgb]);
  const compareRgb = useMemo(() => hexToRgb(compareHex), [compareHex]);

  const ratio = useMemo(() => {
    if (!rgb || !compareRgb) return null;
    return contrastRatio(rgb, compareRgb);
  }, [rgb, compareRgb]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ToolHeader name="Color Converter" description="Convert between HEX, RGB, HSL and OKLCH with a live swatch and WCAG contrast checker." />

      <ToolPanel title="Color" className="mb-4">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={rgb ? rgbToHex(rgb) : "#000000"}
            onChange={(e) => setHex(e.target.value)}
            aria-label="Color picker"
            className="h-10 w-10 cursor-pointer rounded border border-border"
          />
          <input
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            aria-label="HEX color"
            placeholder="#2563eb"
            className="flex-1 rounded-lg border border-border bg-surface-subtle px-3 py-2 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        {rgb && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-surface-subtle p-3 dark:bg-slate-950">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-faint dark:text-slate-500">Swatch</p>
              <div className="mt-2 h-16 w-full rounded-lg border border-border" style={{ backgroundColor: rgbToHex(rgb) }} />
            </div>
            <div className="space-y-1.5 rounded-lg bg-surface-subtle p-3 font-mono text-sm dark:bg-slate-950">
              <div className="flex justify-between"><span className="text-ink-faint">HEX</span><span className="text-ink dark:text-slate-200">{rgbToHex(rgb)}</span></div>
              <div className="flex justify-between"><span className="text-ink-faint">RGB</span><span className="text-ink dark:text-slate-200">{rgb.r}, {rgb.g}, {rgb.b}</span></div>
              {hsl && <div className="flex justify-between"><span className="text-ink-faint">HSL</span><span className="text-ink dark:text-slate-200">{hsl.h}, {hsl.s}%, {hsl.l}%</span></div>}
              {oklch && <div className="flex justify-between"><span className="text-ink-faint">OKLCH</span><span className="text-ink dark:text-slate-200">{oklch.l.toFixed(3)} {oklch.c.toFixed(3)} {oklch.h.toFixed(1)}</span></div>}
            </div>
          </div>
        )}
        {!rgb && <p className="mt-3 text-sm text-danger-600 dark:text-red-400">Invalid color value.</p>}
      </ToolPanel>

      <ToolPanel title="WCAG contrast checker" className="mb-4">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={compareRgb ? rgbToHex(compareRgb) : "#ffffff"}
            onChange={(e) => setCompareHex(e.target.value)}
            aria-label="Compare color picker"
            className="h-10 w-10 cursor-pointer rounded border border-border"
          />
          <input
            value={compareHex}
            onChange={(e) => setCompareHex(e.target.value)}
            aria-label="Compare color"
            placeholder="#ffffff"
            className="flex-1 rounded-lg border border-border bg-surface-subtle px-3 py-2 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>
        {ratio !== null && (
          <div className="mt-4 space-y-2 text-sm">
            <p className="font-medium text-ink dark:text-slate-200">Contrast ratio: {ratio.toFixed(2)}:1</p>
            <div className="grid grid-cols-2 gap-2">
              <div className={`rounded-lg border px-3 py-2 ${ratio >= 4.5 ? "border-accent-500/30 bg-accent-50 text-accent-600 dark:bg-accent-500/10" : "border-danger-500/30 bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-red-400"}`}>
                AA normal text: {ratio >= 4.5 ? "Pass" : "Fail"}
              </div>
              <div className={`rounded-lg border px-3 py-2 ${ratio >= 7 ? "border-accent-500/30 bg-accent-50 text-accent-600 dark:bg-accent-500/10" : "border-danger-500/30 bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-red-400"}`}>
                AAA normal text: {ratio >= 7 ? "Pass" : "Fail"}
              </div>
            </div>
          </div>
        )}
      </ToolPanel>
    </div>
  );
}