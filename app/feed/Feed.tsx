"use client";

import { useEffect, useRef, useState } from "react";
import type { Video } from "@/lib/types";
import { Logo, SoundIcon } from "@/components/icons";
import VideoSlide from "./VideoSlide";
import CommentsSheet from "./CommentsSheet";
import ShareSheet from "./ShareSheet";
import Paywall from "./Paywall";

type LikeState = { liked: boolean; count: number };

export default function Feed({
  videos,
  hasAccess,
  freeLimit,
}: {
  videos: Video[];
  hasAccess: boolean;
  freeLimit: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [commentsFor, setCommentsFor] = useState<string | null>(null);
  const [shareFor, setShareFor] = useState<string | null>(null);

  const [likes, setLikes] = useState<Record<string, LikeState>>(() =>
    Object.fromEntries(videos.map((v) => [v.id, { liked: false, count: v.likes }]))
  );
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(videos.map((v) => [v.id, v.commentsCount]))
  );

  // Observa qual slide está visível
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            setActive(idx);
            if (!hasAccess && idx >= freeLimit) setPaywall(true);
          }
        });
      },
      { root, threshold: 0.6 }
    );
    slideRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [hasAccess, freeLimit]);

  function scrollToIndex(idx: number) {
    slideRefs.current[idx]?.scrollIntoView({ behavior: "smooth" });
  }

  async function toggleLike(id: string) {
    setLikes((prev) => {
      const cur = prev[id] || { liked: false, count: 0 };
      return { ...prev, [id]: { liked: !cur.liked, count: cur.count + (cur.liked ? -1 : 1) } };
    });
    await fetch(`/api/videos/${id}/like`, { method: "POST" }).catch(() => {});
  }

  function closePaywall() {
    setPaywall(false);
    // volta para o último vídeo liberado
    scrollToIndex(Math.max(0, freeLimit - 1));
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* nome fixo no topo */}
      <div className="absolute top-[18px] left-0 right-0 z-30 text-center pointer-events-none">
        <Logo className="text-[18px] drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)]" />
      </div>

      {/* feed com scroll-snap vertical */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {videos.map((v, i) => (
          <div key={v.id} data-idx={i} ref={(el) => { slideRefs.current[i] = el; }} className="h-full w-full">
            <VideoSlide
              video={{ ...v, commentsCount: commentCounts[v.id] ?? v.commentsCount }}
              active={i === active && !paywall}
              mounted={Math.abs(i - active) <= 1}
              muted={!audioUnlocked}
              liked={likes[v.id]?.liked || false}
              likeCount={likes[v.id]?.count ?? v.likes}
              onToggleLike={() => toggleLike(v.id)}
              onOpenComments={() => setCommentsFor(v.id)}
              onOpenShare={() => setShareFor(v.id)}
              registerRef={() => {}}
            />
          </div>
        ))}
      </div>

      {/* overlay: ativar som (primeiro toque) */}
      {!audioUnlocked && (
        <button
          onClick={() => setAudioUnlocked(true)}
          className="absolute inset-0 z-[55] flex flex-col items-center justify-center gap-3.5 bg-black/35 backdrop-blur-[2px]"
        >
          <span className="w-[84px] h-[84px] rounded-full bg-white/15 border border-white/25 flex items-center justify-center breathe">
            <SoundIcon className="w-9 h-9 text-white" />
          </span>
          <span className="text-sm font-semibold drop-shadow">Toque para ativar o som</span>
        </button>
      )}

      <CommentsSheet
        videoId={commentsFor}
        open={!!commentsFor}
        onClose={() => setCommentsFor(null)}
        onAdded={(id) => setCommentCounts((c) => ({ ...c, [id]: (c[id] || 0) + 1 }))}
      />
      <ShareSheet videoId={shareFor} open={!!shareFor} onClose={() => setShareFor(null)} />
      <Paywall open={paywall} onClose={closePaywall} />
    </div>
  );
}
