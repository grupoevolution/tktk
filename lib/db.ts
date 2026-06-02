import fs from "fs";
import path from "path";
import { bunnyUrls } from "./bunny";
import type { Video, Comment } from "./types";

const DATA_DIR =
  process.env.DATA_DIR ||
  (process.env.NODE_ENV === "production" ? "/data" : path.join(process.cwd(), "data"));

function ensureDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {}
}

function readJson<T>(file: string, fallback: T): T {
  try {
    ensureDir();
    const p = path.join(DATA_DIR, file);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson(file: string, data: unknown) {
  try {
    ensureDir();
    fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), "utf-8");
  } catch {}
}

type DB = {
  videos: Video[];
  likes: string[];
  comments: Record<string, Comment[]>;
  buyers: Record<string, "active" | "refunded">;
};

function load(): DB {
  return {
    videos: readJson<Video[]>("videos.json", []).map((v) => ({
      ...v,
      showInLogin: v.showInLogin ?? false,
      blurInLogin: v.blurInLogin ?? true,
    })),
    likes: readJson("likes.json", []),
    comments: readJson("comments.json", {}),
    buyers: readJson("buyers.json", {}),
  };
}

// ============================================================================
// VÍDEOS
// ============================================================================
export async function listPublishedVideos(): Promise<Video[]> {
  const { videos, likes, comments } = load();
  return videos
    .filter((v) => v.published)
    .sort((a, b) => a.position - b.position)
    .map((v) => ({
      ...v,
      likes: likes.filter((k) => k.startsWith(v.id + ":")).length,
      commentsCount: (comments[v.id] || []).length,
    }));
}

export async function listLoginVideos(): Promise<Video[]> {
  const { videos } = load();
  return videos
    .filter((v) => v.showInLogin)
    .sort((a, b) => a.position - b.position);
}

export async function listAllVideos(): Promise<Video[]> {
  const { videos, likes, comments } = load();
  return videos
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((v) => ({
      ...v,
      likes: likes.filter((k) => k.startsWith(v.id + ":")).length,
      commentsCount: (comments[v.id] || []).length,
    }));
}

export async function createVideo(input: {
  caption: string;
  creatorName: string;
  bunnyVideoId: string | null;
  hlsUrl: string | null;
  thumbnailUrl: string | null;
  position: number;
  published: boolean;
  showInLogin: boolean;
  blurInLogin: boolean;
}): Promise<Video> {
  const { videos } = load();
  const { hlsUrl: bunnyHls, thumbnailUrl: bunnyThumb } = bunnyUrls(input.bunnyVideoId);
  const v: Video = {
    id: String(Date.now()),
    likes: 0,
    commentsCount: 0,
    ...input,
    hlsUrl: input.hlsUrl || bunnyHls,
    thumbnailUrl: input.thumbnailUrl || bunnyThumb,
  };
  videos.push(v);
  writeJson("videos.json", videos);
  return v;
}

export async function updateVideo(
  id: string,
  patch: Partial<{
    caption: string;
    creatorName: string;
    position: number;
    published: boolean;
    showInLogin: boolean;
    blurInLogin: boolean;
  }>
): Promise<void> {
  const { videos } = load();
  const v = videos.find((x) => x.id === id);
  if (v) Object.assign(v, patch);
  writeJson("videos.json", videos);
}

export async function deleteVideo(id: string): Promise<void> {
  const db = load();
  db.videos = db.videos.filter((v) => v.id !== id);
  writeJson("videos.json", db.videos);
}

// ============================================================================
// LIKES
// ============================================================================
export async function toggleLike(videoId: string, email: string): Promise<{ liked: boolean }> {
  const { likes } = load();
  const key = `${videoId}:${email}`;
  const idx = likes.indexOf(key);
  if (idx >= 0) {
    likes.splice(idx, 1);
    writeJson("likes.json", likes);
    return { liked: false };
  }
  likes.push(key);
  writeJson("likes.json", likes);
  return { liked: true };
}

// ============================================================================
// COMENTÁRIOS
// ============================================================================
export async function listComments(videoId: string): Promise<Comment[]> {
  const { comments } = load();
  return (comments[videoId] || []).slice().reverse();
}

export async function addComment(videoId: string, email: string, text: string): Promise<Comment> {
  const { comments } = load();
  const c: Comment = {
    id: String(Date.now()),
    authorName: email.split("@")[0],
    text,
    createdAt: new Date().toISOString(),
  };
  comments[videoId] = comments[videoId] || [];
  comments[videoId].push(c);
  writeJson("comments.json", comments);
  return c;
}

// ============================================================================
// COMPRADORES / ACESSO
// ============================================================================
export async function isBuyer(email: string): Promise<boolean> {
  const e = email.toLowerCase().trim();
  const { buyers } = load();
  return buyers[e] === "active";
}

export async function upsertBuyer(
  email: string,
  status: "active" | "refunded",
  _orderId?: string
): Promise<void> {
  const e = email.toLowerCase().trim();
  const { buyers } = load();
  buyers[e] = status;
  writeJson("buyers.json", buyers);
}
