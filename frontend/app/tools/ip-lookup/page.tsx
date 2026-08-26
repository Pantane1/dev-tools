import type { Metadata } from "next";
import IpLookupPage from "./client";

export const metadata: Metadata = {
  title: "IP Address Lookup",
  description: "Look up ownership and network info for an IP.",
  openGraph: {
    title: "Pantane DevTools — IP Address Lookup",
    description: "Look up ownership and network info for an IP.",
  },
};

export default function IpLookupPageRoute() {
  return <IpLookupPage />;
}
