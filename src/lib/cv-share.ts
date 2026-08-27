import type { MasterCv } from "./career-types";

/** Payload carried inside a public share link (no backend needed). */
export type SharePayload = { name: string; cv: MasterCv };

function toBase64Url(input: string) {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeSharePayload(payload: SharePayload) {
  return toBase64Url(JSON.stringify(payload));
}

export function decodeSharePayload(encoded: string): SharePayload | null {
  try {
    const parsed = JSON.parse(fromBase64Url(encoded)) as SharePayload;
    if (!parsed?.cv?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildShareUrl(payload: SharePayload) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/cv/share/${encodeSharePayload(payload)}`;
}

/** Human date for "last edited" labels; tolerates legacy free-text values. */
export function formatEdited(value: string | undefined, locale: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}
