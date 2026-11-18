import { describe, it, expect } from "vitest";
import * as bcrypt from "bcryptjs";

describe("bcrypt logic", () => {
  it("generates a valid bcrypt hash", () => {
    const h = bcrypt.hashSync("password123", 4);
    expect(h).toMatch(/^\$2[ab]\$/);
  });

  it("verifies correct password", () => {
    const h = bcrypt.hashSync("password123", 4);
    expect(bcrypt.compareSync("password123", h)).toBe(true);
  });

  it("rejects wrong password", () => {
    const h = bcrypt.hashSync("password123", 4);
    expect(bcrypt.compareSync("wrong", h)).toBe(false);
  });

  it("higher cost still verifies", () => {
    const h = bcrypt.hashSync("secret", 6);
    expect(bcrypt.compareSync("secret", h)).toBe(true);
  });
});