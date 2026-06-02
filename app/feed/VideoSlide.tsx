"use client";

import { useEffect, useRef, useState } from "react";
import type { Video } from "@/lib/types";
import { HeartIcon, CommentIcon, ShareIcon } from "@/components/icons";

function fmt(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "k" : String(n);
}

export default function VideoSlide({
  video,
  active,
  mounted,
  muted,
  liked,
  likeCount,
  onToggleLike,
  onOpenComments,
  onOpenShare,
  registerRef,
}: {
  video: Video;
  active: boolean;
  mounted: boolean;
  muted: boolean;
  liked: boolean;
  likeCount: number;
  onToggleLike: () => void;
  onOpenComments: () => void;
  onOpenShare: () => void;
  registerRef: (el: HTMLDivElement | null) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [popping, setPopping] = useState(false);

  // Anexa a fonte (HLS adaptativo via hls.js, ou src direto p/ mp4 / Safari).
  useEffect(() => {
    const el = videoRef.current;
    const src = video.hlsUrl;
    if (!el || !mounted || !src) return;
    let destroy: (() => void) | undefined;

    if (src.endsWith(".m3u8")) {
      if (el.canPlayType("application/vnd.apple.mpegurl")) {
        el.src = src;
      } else {
        import("hls.js").then(({ default: Hls }) => {
          if (Hls.isSupported()) {
            const hls = new Hls({ maxBufferLength: 10, capLevelToPlayerSize: true });
            hls.loadSource(src);
            hls.attachMedia(el);
            destroy = () => hls.destroy();
          } else {
            el.src = src;
          }
        });
      }
    } else {
      el.src = src;
    }
    return () => destroy?.();
  }, [mounted, video.hlsUrl]);

  // Play/pause conforme o slide ativo; mudo conforme estado global de áudio.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = muted;
    if (active) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [active, muted, mounted]);

  function doubleTapLike() {
    if (!liked) {
      onToggleLike();
      setPopping(true);
      setTimeout(() => setPopping(false), 400);
    }
  }

  return (
    <div
      ref={registerRef}
      className="relative h-full w-full snap-start snap-always shrink-0 bg-black flex items-center justify-center"
      style={{ scrollSnapStop: "always" }}
    >
      {mounted ? (
        <video
          ref={videoRef}
          loop
          playsInline
          preload="metadata"
          poster={video.thumbnailUrl || undefined}
          className="h-full w-full object-cover"
          onDoubleClick={doubleTapLike}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration) setProgress((v.currentTime / v.duration) * 100);
          }}
        />
      ) : video.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={video.thumbnailUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-neutral-950" />
      )}

      {/* gradiente p/ legibilidade */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/40" />

      {/* meta (sem foto de perfil) */}
      <div className="absolute left-[18px] bottom-[30px] z-20 max-w-[64%]">
        <div className="font-bold text-base mb-[7px]">{video.creatorName}</div>
        <div className="text-sm leading-snug text-white/90">{video.caption}</div>
      </div>

      {/* rail centralizado verticalmente */}
      <div className="absolute right-[14px] top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-[22px]">
        <button className="flex flex-col items-center gap-1.5" onClick={onToggleLike}>
          <span
            className={`w-[54px] h-[54px] rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-90 transition ${
              popping ? "like-pop" : ""
            }`}
          >
            <HeartIcon className={`w-7 h-7 ${liked ? "text-accent" : "text-white"}`} filled={liked} />
          </span>
          <span className={`text-[12.5px] font-semibold ${liked ? "text-accent" : ""}`}>{fmt(likeCount)}</span>
        </button>

        <button className="flex flex-col items-center gap-1.5" onClick={onOpenComments}>
          <span className="w-[54px] h-[54px] rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-90 transition">
            <CommentIcon className="w-7 h-7 text-white" />
          </span>
          <span className="text-[12.5px] font-semibold">{fmt(video.commentsCount)}</span>
        </button>

        <button className="flex flex-col items-center gap-1.5" onClick={onOpenShare}>
          <span className="w-[54px] h-[54px] rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-90 transition">
            <ShareIcon className="w-7 h-7 text-white" />
          </span>
          <span className="text-[12.5px] font-semibold">Enviar</span>
        </button>
      </div>

      {/* barra de progresso */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/15 z-20">
        <div
          className="h-full"
          style={{ width: `${progress}%`, background: "linear-gradient(90deg,#ff0d0d,#ff4d4d)" }}
        />
      </div>
    </div>
  );
}
