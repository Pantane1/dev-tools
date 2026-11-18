import type { Metadata } from "next";
import SessionSecretPage from "./client";

export const metadata: Metadata = {
  title: "Session Secret Generator",
  description: "Generate cryptographically secure session secrets and JWT signing keys client-side.",
  openGraph: {
    title: "Pantane DevTools — Session Secret Generator",
    description: "Generate cryptographically secure session secrets and JWT signing keys client-side.",
  },
};

export default function SessionSecretPageRoute() {
  return <SessionSecretPage />;
}