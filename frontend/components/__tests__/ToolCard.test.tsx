import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolCard } from "@/components/ToolCard";
import type { ToolMeta } from "@/types/tools";

const liveTool: ToolMeta = {
  slug: "json",
  name: "JSON Formatter",
  description: "Format JSON.",
  category: "Developer",
  keywords: ["json"],
  status: "live",
};

const comingSoonTool: ToolMeta = { ...liveTool, slug: "future-tool", status: "coming-soon" };

describe("ToolCard", () => {
  it("renders a link to the tool for a live tool", () => {
    render(<ToolCard tool={liveTool} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/tools/json");
  });

  it("renders no link and a 'Coming soon' badge for an unreleased tool", () => {
    render(<ToolCard tool={comingSoonTool} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });
});
