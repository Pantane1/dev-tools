import type { Metadata } from "next";
import HtmlEntityPage from "./client";

export const metadata: Metadata = {
  title: "HTML Entity Encoder/Decoder",
  description: "Encode or decode HTML entities.",
  openGraph: {
    title: "Pantane DevTools — HTML Entity Encoder/Decoder",
    description: "Encode or decode HTML entities.",
  },
};

export default function HtmlEntityPageRoute() {
  return <HtmlEntityPage />;
}
