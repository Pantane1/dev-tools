import type { Metadata } from "next";
import DnsLookupPage from "./client";

export const metadata: Metadata = {
  title: "DNS Lookup",
  description: "Look up A, AAAA, MX, NS, TXT, CNAME, SOA and CAA records for a domain.",
  openGraph: {
    title: "Pantane DevTools — DNS Lookup",
    description: "Look up A, AAAA, MX, NS, TXT, CNAME, SOA and CAA records for a domain.",
  },
};

export default function DnsLookupPageRoute() {
  return <DnsLookupPage />;
}
