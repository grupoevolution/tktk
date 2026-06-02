import type { Video, Comment } from "./types";

const S = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample";

export const DEMO_VIDEOS: Video[] = [
  { id: "1", caption: "Bastidores do ensaio de hoje ✨", creatorName: "Marina Sttudio", bunnyVideoId: null, hlsUrl: `${S}/BigBuckBunny.mp4`, thumbnailUrl: null, position: 1, published: true, showInLogin: true, blurInLogin: true, baseLikes: 312, likes: 0, commentsCount: 3 },
  { id: "2", caption: "Conteúdo novo toda semana ☀️", creatorName: "Lia Reels", bunnyVideoId: null, hlsUrl: `${S}/ElephantsDream.mp4`, thumbnailUrl: null, position: 2, published: true, showInLogin: true, blurInLogin: true, baseLikes: 178, likes: 0, commentsCount: 2 },
  { id: "3", caption: "Nota de 0 a 10? 🔥", creatorName: "Júlia Costa", bunnyVideoId: null, hlsUrl: `${S}/ForBiggerBlazes.mp4`, thumbnailUrl: null, position: 3, published: true, showInLogin: true, blurInLogin: true, baseLikes: 470, likes: 0, commentsCount: 3 },
  { id: "4", caption: "Exclusivo pra assinantes ✈️", creatorName: "Manu Vibes", bunnyVideoId: null, hlsUrl: `${S}/ForBiggerEscapes.mp4`, thumbnailUrl: null, position: 4, published: true, showInLogin: false, blurInLogin: true, baseLikes: 230, likes: 0, commentsCount: 1 },
  { id: "5", caption: "Prévia quente 💋", creatorName: "Bella Nunes", bunnyVideoId: null, hlsUrl: `${S}/ForBiggerFun.mp4`, thumbnailUrl: null, position: 5, published: true, showInLogin: false, blurInLogin: true, baseLikes: 95, likes: 0, commentsCount: 0 },
];

export const DEMO_COMMENTS: Record<string, Comment[]> = {
  "1": [
    { id: "c1", authorName: "Júlia", text: "Perfeita 😍", createdAt: new Date().toISOString() },
    { id: "c2", authorName: "Bruno", text: "Que produção!", createdAt: new Date().toISOString() },
    { id: "c3", authorName: "Ana", text: "Amei", createdAt: new Date().toISOString() },
  ],
  "2": [
    { id: "c4", authorName: "Carla", text: "🔥", createdAt: new Date().toISOString() },
    { id: "c5", authorName: "Pedro", text: "Top demais", createdAt: new Date().toISOString() },
  ],
  "3": [
    { id: "c6", authorName: "Rafa", text: "10", createdAt: new Date().toISOString() },
    { id: "c7", authorName: "Bia", text: "💎", createdAt: new Date().toISOString() },
    { id: "c8", authorName: "Léo", text: "🔥🔥🔥", createdAt: new Date().toISOString() },
  ],
  "4": [{ id: "c9", authorName: "Duda", text: "quero mais!", createdAt: new Date().toISOString() }],
};

export function demoIsBuyer(email: string): boolean {
  const e = email.toLowerCase();
  return e.includes("vip") || e.includes("pago");
}
