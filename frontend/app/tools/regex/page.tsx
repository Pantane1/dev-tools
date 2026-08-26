import type { Metadata } from "next";
import RegexPage from "./client";

export const metadata: Metadata = {
  title: "Regex Tester",
  description: "Test regular expressions against sample text with match highlighting.",
  openGraph: {
    title: "Pantane DevTools — Regex Tester",
    description: "Test regular expressions against sample text with match highlighting.",
  },
};

export default function RegexPageRoute() {
  return <RegexPage />;
}
