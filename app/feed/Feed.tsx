"use client";

import { useEffect, useRef, useState } from "react";
import type { Video } from "@/lib/types";
import { Logo, SoundIcon } from "@/components/icons";
import VideoSlide from "./VideoSlide";
import CommentsSheet from "./CommentsSheet";
import ShareSheet from "./ShareSheet";
import Paywall from "./Paywall";

// ============================================================================
// Shuffle determinístico com seed (Mulberry32)
// ============================================================================
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) | 0;
  return h >>> 0;
}

function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Seed muda a cada "época" (bloco de N vídeos consumidos)
// para que o mesmo usuário veja ordens diferentes conforme avança
function computeSeed(email: string, epoch: number): number {
  return hashStr(`${email}:${epoch}`);
}

// ============================================================================
// Componente principal
// ============================================================================
type LikeState = { liked: boolean; count: number };

export default function Feed({
  videos,
  hasAccess,
  freeLimit,
  email,
}: {
  videos: Video[];
  hasAccess: boolean;
  freeLimit: number;
  email: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [commentsFor, setCommentsFor] = useState<string | null>(null);
  const [shareFor, setShareFor] = useState<string | null>(null);
  const [sorted, setSorted] = useState<Video[]>([]);

  const [likes, setLikes] = useState<Record<string, LikeState>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  // Embaralha vídeos na montagem usando email como seed, avança pela época salva
  useEffect(() => {
    if (!videos.length) return;
    const EPOCH_SIZE = Math.max(videos.length, 20);
    const storageKey = `tktk_epoch_${hashStr(email)}`;
    const epoch = parseInt(localStorage.getItem(storageKey) || "0", 10);
    const shuffled = shuffleWithSeed(videos, computeSeed(email, epoch));

    // Quando o usuário chegar ao fim, incrementa a época para próxima sessão
    const handleEpochAdvance = () => {
      localStorage.setItem(storageKey, String(epoch + 1));
    };

    setSorted(shuffled);
    setLikes(Object.fromEntries(shuffled.map((v) => [v.id, { liked: false, count: v.likes }])));
    setCommentCounts(Object.fromEntries(shuffled.map((v) => [v.id, v.commentsCount])));

    // Avança época quando usuário vê mais de 80% dos vídeos
    const threshold = Math.floor(EPOCH_SIZE * 0.8);
    let advanced = false;
    const checkEpoch = (idx: number) => {
      if (!advanced && idx >= threshold) {
        advanced = true;
        handleEpochAdvance();
      }
    };
    // Expõe para o observer via ref
    (window as any).__tktk_checkEpoch = checkEpoch;
  }, [videos, email]);

  // Observa qual slide está visível
  useEffect(() => {
    const root = containerRef.current;
    if (!root || !sorted.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            setActive(idx);
            if (!hasAccess && idx >= freeLimit) setPaywall(true);
            (window as any).__tktk_checkEpoch?.(idx);
          }
        });
      },
      { root, threshold: 0.6 }
    );
    slideRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [hasAccess, freeLimit, sorted]);

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
    scrollToIndex(Math.max(0, freeLimit - 1));
  }

  if (!sorted.length) {
    return (
      <div className="fixed inset-0 bg-[#050506] flex flex-col items-center justify-center gap-4 text-center px-6">
        <Logo className="text-2xl" />
        <p className="text-white/50 text-sm mt-2">Nenhum vídeo disponível ainda.<br />Volte em breve.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      <div className="absolute top-[18px] left-0 right-0 z-30 text-center pointer-events-none">
        <Logo className="text-[18px] drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)]" />
      </div>

      <div
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {sorted.map((v, i) => (
          <div key={v.id} data-idx={i} ref={(el) => { slideRefs.current[i] = el; }} className="h-full w-full snap-start">
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
