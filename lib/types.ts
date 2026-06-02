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
  likes: number;
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
