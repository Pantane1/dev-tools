import type { Metadata } from "next";
import PasswordGeneratorPage from "./client";

export const metadata: Metadata = {
  title: "Password Generator",
  description: "Generate cryptographically secure passwords with an entropy estimate.",
  openGraph: {
    title: "Pantane DevTools — Password Generator",
    description: "Generate cryptographically secure passwords with an entropy estimate.",
  },
};

export default function PasswordGeneratorPageRoute() {
  return <PasswordGeneratorPage />;
}
