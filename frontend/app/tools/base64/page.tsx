import type { Metadata } from "next";
import Base64Page from "./client";

export const metadata: Metadata = {
  title: "Base64 Encoder/Decoder",
  description: "Encode or decode text using standard or URL-safe Base64.",
  openGraph: {
    title: "Pantane DevTools — Base64 Encoder/Decoder",
    description: "Encode or decode text using standard or URL-safe Base64.",
  },
};

export default function Base64PageRoute() {
  return <Base64Page />;
}
