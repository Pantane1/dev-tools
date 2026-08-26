import type { Metadata } from "next";
import HashGeneratorPage from "./client";

export const metadata: Metadata = {
  title: "Hash Generator",
  description: "Generate MD5, SHA-1, SHA-256, SHA-384 or SHA-512 hashes from text or a file.",
  openGraph: {
    title: "Pantane DevTools — Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, SHA-384 or SHA-512 hashes from text or a file.",
  },
};

export default function HashGeneratorPageRoute() {
  return <HashGeneratorPage />;
}
