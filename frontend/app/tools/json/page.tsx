import type { Metadata } from "next";
import JsonFormatterPage from "./client";

export const metadata: Metadata = {
  title: "JSON Formatter",
  description: "Format, minify, and validate JSON with precise error locations.",
  openGraph: {
    title: "Pantane DevTools — JSON Formatter",
    description: "Format, minify, and validate JSON with precise error locations.",
  },
};

export default function JsonFormatterPageRoute() {
  return <JsonFormatterPage />;
}
