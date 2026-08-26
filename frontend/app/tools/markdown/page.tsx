import type { Metadata } from "next";
import MarkdownPreviewPage from "./client";

export const metadata: Metadata = {
  title: "Markdown Preview",
  description: "Preview rendered Markdown side by side with the source.",
  openGraph: {
    title: "Pantane DevTools — Markdown Preview",
    description: "Preview rendered Markdown side by side with the source.",
  },
};

export default function MarkdownPreviewPageRoute() {
  return <MarkdownPreviewPage />;
}
