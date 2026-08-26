import type { Metadata } from "next";
import UuidGeneratorPage from "./client";

export const metadata: Metadata = {
  title: "UUID Generator",
  description: "Generate one or many UUID v4 identifiers.",
  openGraph: {
    title: "Pantane DevTools — UUID Generator",
    description: "Generate one or many UUID v4 identifiers.",
  },
};

export default function UuidGeneratorPageRoute() {
  return <UuidGeneratorPage />;
}
