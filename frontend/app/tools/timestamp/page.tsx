import type { Metadata } from "next";
import TimestampPage from "./client";

export const metadata: Metadata = {
  title: "Timestamp Converter",
  description: "Convert between Unix timestamps and human-readable dates.",
  openGraph: {
    title: "Pantane DevTools — Timestamp Converter",
    description: "Convert between Unix timestamps and human-readable dates.",
  },
};

export default function TimestampPageRoute() {
  return <TimestampPage />;
}
