import { NextResponse } from "next/server";
import { currentEmail } from "@/lib/auth";
import { listComments, addComment } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const comments = await listComments(params.id);
  return NextResponse.json({ comments });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const email = currentEmail();
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { text } = await req.json().catch(() => ({}));
  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Comentário vazio" }, { status: 400 });
  }
  const comment = await addComment(params.id, email, text.trim().slice(0, 500));
  return NextResponse.json({ comment });
}
