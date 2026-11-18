import type { Metadata } from "next";
import CronPage from "./client";

export const metadata: Metadata = {
  title: "Cron Expression Generator",
  description: "Build, validate and explain cron expressions with next-run previews.",
  openGraph: {
    title: "Pantane DevTools — Cron Expression Generator",
    description: "Build, validate and explain cron expressions with next-run previews.",
  },
};

export default function CronPageRoute() {
  return <CronPage />;
}