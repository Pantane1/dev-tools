import type { Metadata } from "next";
import YamlJsonPage from "./client";

export const metadata: Metadata = {
  title: "YAML ↔ JSON Converter",
  description: "Convert between YAML and JSON.",
  openGraph: {
    title: "Pantane DevTools — YAML ↔ JSON Converter",
    description: "Convert between YAML and JSON.",
  },
};

export default function YamlJsonPageRoute() {
  return <YamlJsonPage />;
}
