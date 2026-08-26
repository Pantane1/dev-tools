import type { Metadata } from "next";
// stubbed for sandbox build check
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const inter = { variable: "font-inter" };
const jetbrainsMono = { variable: "font-jetbrains-mono" };

export const metadata: Metadata = {
  metadataBase: new URL("<https://pantane-devtools-web.onrender.com>"),
  title: {
    default: "Pantane DevTools — Your everyday developer toolbox",
    template: "Pantane DevTools — %s",
  },
  description:
    "Fast, simple utilities for developers, students, sysadmins and security enthusiasts — JSON, JWT, hashing, passwords, DNS, SSL and more.",
  openGraph: {
    title: "Pantane DevTools",
    description: "Fast, simple utilities for developers, students, sysadmins and security enthusiasts.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
