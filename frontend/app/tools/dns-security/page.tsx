import type { Metadata } from "next";
import DnsSecurityPage from "./client";

export const metadata: Metadata = {
  title: "DNS Security Checker",
  description: "Check SPF, DMARC, DKIM, DNSSEC and CAA records with a security score.",
  openGraph: {
    title: "Pantane DevTools — DNS Security Checker",
    description: "Check SPF, DMARC, DKIM, DNSSEC and CAA records with a security score.",
  },
};

export default function DnsSecurityPageRoute() {
  return <DnsSecurityPage />;
}
