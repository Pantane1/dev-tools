import type { Metadata } from "next";
import IpInfoPage from "./client";

export const metadata: Metadata = {
  title: "IP Information",
  description: "Look up basic information about an IP address.",
  openGraph: {
    title: "Pantane DevTools — IP Information",
    description: "Look up basic information about an IP address.",
  },
};

export default function IpInfoPageRoute() {
  return <IpInfoPage />;
}
