import { NextResponse } from "next/server";
import { serializeAdmin, ADMIN_COOKIE } from "@/lib/session";
import { ADMIN_PASSWORD } from "@/lib/config";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}));
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, serializeAdmin(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
