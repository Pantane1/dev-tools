import type { Metadata } from "next";
import HeadersCheckerPage from "./client";

export const metadata: Metadata = {
  title: "HTTP Security Headers Checker",
  description: "Inspect a site's security headers, what's missing, and why it matters.",
  openGraph: {
    title: "Pantane DevTools — HTTP Security Headers Checker",
    description: "Inspect a site's security headers, what's missing, and why it matters.",
  },
};

export default function HeadersCheckerPageRoute() {
  return <HeadersCheckerPage />;
}
