import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { listAllVideos, createVideo, updateVideo, deleteVideo } from "@/lib/db";
import { bunnyUrls } from "@/lib/bunny";

function guard() {
  if (!isAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  return null;
}

export async function GET() {
  const denied = guard();
  if (denied) return denied;
  const videos = await listAllVideos();
  return NextResponse.json({ videos });
}

export async function POST(req: Request) {
  const denied = guard();
  if (denied) return denied;
  const body = await req.json().catch(() => ({}));
  const caption = String(body.caption || "").trim();
  const creatorName = String(body.creatorName || "").trim();
  const bunnyVideoId = body.bunnyVideoId ? String(body.bunnyVideoId).trim() : null;
  const hlsUrlInput = body.hlsUrl ? String(body.hlsUrl).trim() : null;
  const position = Number(body.position || 0);
  const published = body.published !== false;

  if (!creatorName) return NextResponse.json({ error: "Informe o nome do creator" }, { status: 400 });
  if (!bunnyVideoId && !hlsUrlInput) {
    return NextResponse.json({ error: "Informe o ID do Bunny ou uma URL de vídeo" }, { status: 400 });
  }

  const { hlsUrl, thumbnailUrl } = bunnyUrls(bunnyVideoId);
  const video = await createVideo({
    caption,
    creatorName,
    bunnyVideoId,
    hlsUrl: hlsUrlInput || hlsUrl,
    thumbnailUrl,
    position,
    published,
  });
  return NextResponse.json({ video });
}

export async function PATCH(req: Request) {
  const denied = guard();
  if (denied) return denied;
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "ID ausente" }, { status: 400 });
  await updateVideo(id, {
    caption: body.caption,
    creatorName: body.creatorName,
    position: body.position !== undefined ? Number(body.position) : undefined,
    published: body.published,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const denied = guard();
  if (denied) return denied;
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "ID ausente" }, { status: 400 });
  await deleteVideo(String(id));
  return NextResponse.json({ ok: true });
}
