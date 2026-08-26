import type { Metadata } from "next";
import QrGeneratorPage from "./client";

export const metadata: Metadata = {
  title: "QR Code Generator",
  description: "Generate QR codes from text, a URL, Wi-Fi credentials, email or phone.",
  openGraph: {
    title: "Pantane DevTools — QR Code Generator",
    description: "Generate QR codes from text, a URL, Wi-Fi credentials, email or phone.",
  },
};

export default function QrGeneratorPageRoute() {
  return <QrGeneratorPage />;
}
