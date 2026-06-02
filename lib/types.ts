export type Video = {
  id: string;
  caption: string;
  creatorName: string;
  bunnyVideoId: string | null;
  hlsUrl: string | null;
  thumbnailUrl: string | null;
  position: number;
  published: boolean;
  showInLogin: boolean;
  blurInLogin: boolean;
  baseLikes: number; // curtidas base (50-500), geradas ao criar o vídeo
  likes: number;     // curtidas reais dos usuários
  commentsCount: number;
};

export type Comment = {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
};

export type Settings = {
  appName: string;
  freeLimit: number;
  loginBlur: boolean;
};

export type SessionData = {
  email: string;
};
