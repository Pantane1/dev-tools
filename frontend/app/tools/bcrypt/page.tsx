import type { Metadata } from "next";
import BcryptPage from "./client";

export const metadata: Metadata = {
  title: "Bcrypt Password Hash Generator",
  description: "Generate and verify bcrypt password hashes entirely in your browser — passwords never leave your device.",
  openGraph: {
    title: "Pantane DevTools — Bcrypt Password Hash Generator",
    description: "Generate and verify bcrypt password hashes entirely in your browser.",
  },
};

export default function BcryptPageRoute() {
  return <BcryptPage />;
}