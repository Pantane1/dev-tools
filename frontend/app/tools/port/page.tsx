import type { Metadata } from "next";
import PortCheckerPage from "./client";

export const metadata: Metadata = {
  title: "Port Checker",
  description: "Check whether a port is open on a host.",
  openGraph: {
    title: "Pantane DevTools — Port Checker",
    description: "Check whether a port is open on a host.",
  },
};

export default function PortCheckerPageRoute() {
  return <PortCheckerPage />;
}
