import type { Metadata } from "next";
import JwtDecoderPage from "./client";

export const metadata: Metadata = {
  title: "JWT Decoder",
  description: "Decode a JWT's header and payload, and check its expiry.",
  openGraph: {
    title: "Pantane DevTools — JWT Decoder",
    description: "Decode a JWT's header and payload, and check its expiry.",
  },
};

export default function JwtDecoderPageRoute() {
  return <JwtDecoderPage />;
}
