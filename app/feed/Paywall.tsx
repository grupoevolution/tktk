"use client";

import { LockIcon } from "@/components/icons";

export default function Paywall({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center gap-2 px-8 text-center bg-[#0a0a0b]/70 backdrop-blur-xl">
      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-2">
        <LockIcon className="w-[30px] h-[30px] text-white" />
      </div>
      <h2 className="text-[21px] font-bold tracking-tight">Continue assistindo</h2>
      <p className="text-sm text-dim leading-relaxed max-w-[280px] mb-3.5">
        Você viu seus vídeos gratuitos. Assine para ter acesso ilimitado a todo o conteúdo.
      </p>
      <a
        href={process.env.NEXT_PUBLIC_CHECKOUT_URL || "#"}
        className="w-full max-w-[320px] py-[15px] rounded-full text-[15px] font-bold text-white"
        style={{ background: "linear-gradient(90deg,#ff1414,#cc0000)" }}
      >
        Liberar acesso completo
      </a>
      <button className="mt-2.5 text-[13px] text-dim" onClick={onClose}>
        Agora não
      </button>
    </div>
  );
}
