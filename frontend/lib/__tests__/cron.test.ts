import { describe, it, expect } from "vitest";
import { parseCron, nextRuns, explain } from "@/lib/cron";

describe("cron helpers", () => {
  it("parses valid expression", () => {
    const parsed = parseCron("*/5 * * * *");
    expect(parsed.fields).toHaveLength(5);
  });

  it("rejects invalid field count", () => {
    expect(() => parseCron("* * *")).toThrow();
  });

  it("rejects out-of-range values", () => {
    expect(() => parseCron("60 * * * *")).toThrow();
  });

  it("computes next runs", () => {
    const runs = nextRuns("*/5 * * * *", 3, new Date("2026-01-01T00:00:00Z"));
    expect(runs).toHaveLength(3);
    // each run 5 minutes apart
    expect(runs[1]!.getTime() - runs[0]!.getTime()).toBe(5 * 60 * 1000);
  });

  it("explain returns a string", () => {
    expect(typeof explain("0 9 * * 1-5")).toBe("string");
    expect(explain("0 9 * * 1-5")).toContain("minute 0");
  });
});