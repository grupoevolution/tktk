"use client";

import { useState } from "react";
import { WhatsappIcon, LinkIcon } from "@/components/icons";

export default function ShareSheet({
  videoId,
  open,
  onClose,
}: {
  videoId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined" && videoId
      ? `${window.location.origin}/?v=${videoId}`
      : "";

  function shareWhatsapp() {
    const text = encodeURIComponent(`Olha esse vídeo 🔥 ${shareUrl}`);
    // Web Share API (mobile) permite escolher conversa OU status; fallback wa.me
    if (navigator.share) {
      navigator.share({ url: shareUrl, text: "Olha esse vídeo 🔥" }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <>
      <div
        className={`absolute inset-0 z-40 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div className={`sheet ${open ? "open" : ""} absolute left-0 right-0 bottom-0 z-50 bg-[#161618] rounded-t-[22px]`}>
        <div className="w-[38px] h-1 bg-white/25 rounded mx-auto mt-2.5 mb-1" />
        <div className="text-center text-[13.5px] font-semibold text-dim py-1.5 border-b border-white/[0.07]">
          Compartilhar
        </div>
        <div className="p-4 flex flex-col gap-2.5">
          <button
            onClick={shareWhatsapp}
            className="flex items-center gap-3.5 px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-left"
          >
            <span className="w-[42px] h-[42px] rounded-xl bg-wa flex items-center justify-center shrink-0">
              <WhatsappIcon className="w-[22px] h-[22px] text-white" />
            </span>
            <span className="text-[14.5px] font-semibold">
              WhatsApp
              <small className="block font-normal text-dim text-xs mt-0.5">Enviar para conversa ou status</small>
            </span>
          </button>

          <button
            onClick={copyLink}
            className="flex items-center gap-3.5 px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-left"
          >
            <span className="w-[42px] h-[42px] rounded-xl bg-white/12 flex items-center justify-center shrink-0">
              <LinkIcon className="w-[22px] h-[22px] text-white" />
            </span>
            <span className="text-[14.5px] font-semibold">
              {copied ? "Link copiado!" : "Copiar link"}
              <small className="block font-normal text-dim text-xs mt-0.5">Link direto para este vídeo</small>
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
