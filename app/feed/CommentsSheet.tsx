"use client";

import { useEffect, useRef, useState } from "react";
import type { Comment } from "@/lib/types";

export default function CommentsSheet({
  videoId,
  open,
  onClose,
  onAdded,
}: {
  videoId: string | null;
  open: boolean;
  onClose: () => void;
  onAdded: (videoId: string) => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !videoId) return;
    setLoading(true);
    fetch(`/api/videos/${videoId}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .finally(() => setLoading(false));
  }, [open, videoId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !videoId) return;
    const res = await fetch(`/api/videos/${videoId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const { comment } = await res.json();
      setComments((c) => [comment, ...c]);
      setText("");
      onAdded(videoId);
    }
  }

  return (
    <>
      <div
        className={`absolute inset-0 z-40 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div
        className={`sheet ${open ? "open" : ""} absolute left-0 right-0 bottom-0 z-50 bg-[#161618] rounded-t-[22px] flex flex-col max-h-[70%]`}
      >
        <div className="w-[38px] h-1 bg-white/25 rounded mx-auto mt-2.5 mb-1" />
        <div className="text-center text-[13.5px] font-semibold text-dim py-1.5 border-b border-white/[0.07]">
          {comments.length} comentários
        </div>

        <div className="overflow-y-auto px-4 py-3 flex flex-col gap-3.5 flex-1 no-scrollbar">
          {loading ? (
            <p className="text-dim text-sm text-center py-4">Carregando...</p>
          ) : comments.length === 0 ? (
            <p className="text-dim text-sm text-center py-4">Seja o primeiro a comentar 💬</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex flex-col gap-0.5">
                <span className="text-[12.5px] font-semibold text-dim">{c.authorName}</span>
                <span className="text-sm leading-snug">{c.text}</span>
              </div>
            ))
          )}
        </div>

        <form className="flex gap-2 px-3.5 py-3 border-t border-white/10 bg-[#161618]" onSubmit={send}>
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Adicione um comentário..."
            className="flex-1 bg-white/[0.07] border border-white/10 rounded-full px-4 py-2.5 text-sm outline-none"
          />
          <button
            type="submit"
            className="px-[18px] rounded-full font-semibold text-sm text-white"
            style={{ background: "linear-gradient(90deg,#ff0d0d,#ff4d4d)" }}
          >
            Enviar
          </button>
        </form>
      </div>
    </>
  );
}
