import type { Metadata } from "next";
import SslCheckerPage from "./client";

export const metadata: Metadata = {
  title: "SSL/TLS Checker",
  description: "Check a domain's certificate validity, issuer, SANs and expiry.",
  openGraph: {
    title: "Pantane DevTools — SSL/TLS Checker",
    description: "Check a domain's certificate validity, issuer, SANs and expiry.",
  },
};

export default function SslCheckerPageRoute() {
  return <SslCheckerPage />;
}
