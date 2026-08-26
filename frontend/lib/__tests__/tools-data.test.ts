import { describe, it, expect } from "vitest";
import { TOOLS, LIVE_TOOLS, CATEGORIES } from "@/lib/tools-data";

describe("tools-data registry", () => {
  it("every tool has a unique slug", () => {
    const slugs = TOOLS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every tool's category is one of the defined CATEGORIES", () => {
    for (const tool of TOOLS) {
      expect(CATEGORIES).toContain(tool.category);
    }
  });

  it("every tool has a non-empty name, description, and at least one keyword", () => {
    for (const tool of TOOLS) {
      expect(tool.name.length).toBeGreaterThan(0);
      expect(tool.description.length).toBeGreaterThan(0);
      expect(tool.keywords.length).toBeGreaterThan(0);
    }
  });

  it("LIVE_TOOLS contains only tools marked status: live", () => {
    expect(LIVE_TOOLS.every((t) => t.status === "live")).toBe(true);
    expect(LIVE_TOOLS.length).toBeLessThanOrEqual(TOOLS.length);
  });

  it("every live tool's slug matches an actual route folder", async () => {
    // This is the exact bug we hit earlier in this project (port vs
    // port-checker) — a registry slug with no matching folder means a
    // dead link in the directory and search results.
    const fs = await import("fs");
    const path = await import("path");
    for (const tool of LIVE_TOOLS) {
      const pagePath = path.resolve(__dirname, `../../app/tools/${tool.slug}/page.tsx`);
      expect(fs.existsSync(pagePath), `Missing route folder for slug "${tool.slug}"`).toBe(true);
    }
  });
});
