import { describe, it, expect } from "vitest";
import { diffLines } from "@/lib/diff";

describe("diff helpers", () => {
  it("returns empty for identical input", () => {
    const d = diffLines(["a", "b"], ["a", "b"]);
    expect(d.every((l) => l.type === "same")).toBe(true);
  });

  it("detects additions", () => {
    const d = diffLines(["a"], ["a", "b"]);
    expect(d.some((l) => l.type === "add" && l.text === "b")).toBe(true);
  });

  it("detects deletions", () => {
    const d = diffLines(["a", "b"], ["a"]);
    expect(d.some((l) => l.type === "del" && l.text === "b")).toBe(true);
  });

  it("handles completely different inputs", () => {
    const d = diffLines(["x"], ["y"]);
    expect(d.filter((l) => l.type === "del")).toHaveLength(1);
    expect(d.filter((l) => l.type === "add")).toHaveLength(1);
  });
});