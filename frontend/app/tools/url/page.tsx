import type { Metadata } from "next";
import UrlEncodePage from "./client";

export const metadata: Metadata = {
  title: "URL Encoder/Decoder",
  description: "Encode or decode URL components.",
  openGraph: {
    title: "Pantane DevTools — URL Encoder/Decoder",
    description: "Encode or decode URL components.",
  },
};

export default function UrlEncodePageRoute() {
  return <UrlEncodePage />;
}
