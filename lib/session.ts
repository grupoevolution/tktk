import crypto from "crypto";
import type { SessionData } from "./types";

const SECRET = process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
export const SESSION_COOKIE = "tktk_session";

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function serializeSession(data: SessionData): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verify(payload: string, sig: string): boolean {
  const expected = sign(payload);
  return (
    sig.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  );
}

export function parseSession(token: string | undefined | null): SessionData | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !verify(payload, sig)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionData;
  } catch {
    return null;
  }
}

// ---- Sessão do admin (cookie separado) ----
export const ADMIN_COOKIE = "tktk_admin";

export function serializeAdmin(): string {
  const payload = Buffer.from("admin").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function isValidAdmin(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !verify(payload, sig)) return false;
  return Buffer.from(payload, "base64url").toString() === "admin";
}
