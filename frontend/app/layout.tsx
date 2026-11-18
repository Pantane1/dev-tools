import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://pantane-devtools-web.onrender.com"),
  title: {
    default: "Pantane DevTools — Your everyday developer toolbox",
    template: "Pantane DevTools — %s",
  },
  description:
    "Fast, simple utilities for developers, students, sysadmins and security enthusiasts — JSON, JWT, hashing, passwords, DNS, SSL and more.",
  themeColor: "#2563EB",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pantane DevTools",
  },
  openGraph: {
    title: "Pantane DevTools",
    description: "Fast, simple utilities for developers, students, sysadmins and security enthusiasts.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#2563EB",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ServiceWorkerRegistration />
        </ThemeProvider>
      </body>
    </html>
  );
}
