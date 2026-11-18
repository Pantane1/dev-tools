import type { Metadata } from "next";
import ColorPage from "./client";

export const metadata: Metadata = {
  title: "Color Converter",
  description: "Convert colors between HEX, RGB, HSL and OKLCH with a live swatch and WCAG contrast checker.",
  openGraph: {
    title: "Pantane DevTools — Color Converter",
    description: "Convert colors between HEX, RGB, HSL and OKLCH with a live swatch and WCAG contrast checker.",
  },
};

export default function ColorPageRoute() {
  return <ColorPage />;
}