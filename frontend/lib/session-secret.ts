export type SecretFormat = "hex" | "base64" | "base64url";

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function bytesToBase64(bytes: Uint8Array, urlSafe: boolean): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  let b64 = btoa(binary);
  if (urlSafe) {
    b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return b64;
}

export function generateSecret(byteLength: number, format: SecretFormat): string {
  const bytes = new Uint8Array(byteLength);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else {
    // Fallback for non-browser (tests) — not cryptographically secure
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  if (format === "hex") return bytesToHex(bytes);
  if (format === "base64") return bytesToBase64(bytes, false);
  return bytesToBase64(bytes, true);
}