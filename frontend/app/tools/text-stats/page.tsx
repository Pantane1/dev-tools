import type { Metadata } from "next";
import TextStatsPage from "./client";

export const metadata: Metadata = {
  title: "Text Statistics",
  description: "Count characters, words, lines and estimate reading time.",
  openGraph: {
    title: "Pantane DevTools — Text Statistics",
    description: "Count characters, words, lines and estimate reading time.",
  },
};

export default function TextStatsPageRoute() {
  return <TextStatsPage />;
}
