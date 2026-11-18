import { describe, it, expect } from "vitest";
import { generateSecret, bytesToHex, bytesToBase64 } from "@/lib/session-secret";

describe("session-secret helpers", () => {
  it("bytesToHex produces correct hex", () => {
    expect(bytesToHex(new Uint8Array([0, 15, 255]))).toBe("000fff");
  });

  it("bytesToBase64 produces standard base64", () => {
    expect(bytesToBase64(new Uint8Array([1, 2, 3]), false)).toBe("AQID");
  });

  it("bytesToBase64 url-safe strips padding and replaces chars", () => {
    const out = bytesToBase64(new Uint8Array([251, 255, 254]), true);
    expect(out).not.toMatch(/[+/=]/);
  });

  it("generateSecret hex length matches byte length * 2", () => {
    const s = generateSecret(16, "hex");
    expect(s).toHaveLength(32);
    expect(/^[0-9a-f]+$/.test(s)).toBe(true);
  });

  it("generateSecret base64 length is sane", () => {
    const s = generateSecret(32, "base64");
    expect(s.length).toBeGreaterThan(40);
  });

  it("generateSecret base64url has no padding", () => {
    const s = generateSecret(32, "base64url");
    expect(s).not.toMatch(/=/);
  });
});