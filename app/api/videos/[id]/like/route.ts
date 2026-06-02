import { NextResponse } from "next/server";
import { currentEmail } from "@/lib/auth";
import { toggleLike } from "@/lib/db";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const email = currentEmail();
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const result = await toggleLike(params.id, email);
  return NextResponse.json(result);
}
