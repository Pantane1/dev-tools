import type { Metadata } from "next";
import CsvJsonPage from "./client";

export const metadata: Metadata = {
  title: "CSV ↔ JSON Converter",
  description: "Convert between CSV and JSON.",
  openGraph: {
    title: "Pantane DevTools — CSV ↔ JSON Converter",
    description: "Convert between CSV and JSON.",
  },
};

export default function CsvJsonPageRoute() {
  return <CsvJsonPage />;
}
