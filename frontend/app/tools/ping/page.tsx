import type { Metadata } from "next";
import PingPage from "./client";

export const metadata: Metadata = {
  title: "Ping / Latency Checker",
  description: "Check round-trip latency to a host.",
  openGraph: {
    title: "Pantane DevTools — Ping / Latency Checker",
    description: "Check round-trip latency to a host.",
  },
};

export default function PingPageRoute() {
  return <PingPage />;
}
