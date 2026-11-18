import type { Metadata } from "next";
import DiffPage from "./client";

export const metadata: Metadata = {
  title: "Text Diff Checker",
  description: "Compare two texts line by line and see additions, removals and unchanged lines.",
  openGraph: {
    title: "Pantane DevTools — Text Diff Checker",
    description: "Compare two texts line by line and see additions, removals and unchanged lines.",
  },
};

export default function DiffPageRoute() {
  return <DiffPage />;
}