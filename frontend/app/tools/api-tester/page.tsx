import type { Metadata } from "next";
import ApiTesterPage from "./client";

export const metadata: Metadata = {
  title: "HTTP Request Tester",
  description: "Send GET, POST, PUT, PATCH or DELETE requests and inspect the response.",
  openGraph: {
    title: "Pantane DevTools — HTTP Request Tester",
    description: "Send GET, POST, PUT, PATCH or DELETE requests and inspect the response.",
  },
};

export default function ApiTesterPageRoute() {
  return <ApiTesterPage />;
}
