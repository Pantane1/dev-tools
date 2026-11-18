import type { Metadata } from "next";
import ChmodPage from "./client";

export const metadata: Metadata = {
  title: "Unix chmod Calculator",
  description: "Convert between octal and symbolic Unix file permissions with an interactive r/w/x matrix.",
  openGraph: {
    title: "Pantane DevTools — Unix chmod Calculator",
    description: "Convert between octal and symbolic Unix file permissions with an interactive r/w/x matrix.",
  },
};

export default function ChmodPageRoute() {
  return <ChmodPage />;
}