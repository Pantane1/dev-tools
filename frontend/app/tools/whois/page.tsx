import type { Metadata } from "next";
import WhoisPage from "./client";

export const metadata: Metadata = {
  title: "WHOIS Lookup",
  description: "Look up domain registration details.",
  openGraph: {
    title: "Pantane DevTools — WHOIS Lookup",
    description: "Look up domain registration details.",
  },
};

export default function WhoisPageRoute() {
  return <WhoisPage />;
}
