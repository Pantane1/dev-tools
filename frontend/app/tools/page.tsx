import type { Metadata } from "next";
import Client from "./Client";

export const metadata: Metadata = {
  title: "All Tools",
  description: "Browse every tool in Pantane DevTools — JSON, JWT, hashing, DNS, SSL, regex, QR codes and more.",
  openGraph: {
    title: "Pantane DevTools — All Tools",
    description: "Browse every tool in Pantane DevTools.",
  },
};

export default function Page() {
  return <Client />;
}
