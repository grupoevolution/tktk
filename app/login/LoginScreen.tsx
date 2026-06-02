"use client";

import { useRef, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/icons";

type Item = { src: string | null; thumb: string | null; blur?: boolean };

const ROWS = 3;
const SPEEDS = [28, 38, 32];
const LOOP_SECONDS = 4; // loop nos primeiros N segundos do vídeo

function GalleryCard({ item }: { item: Item }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  function handleTimeUpdate() {
    const v = videoRef.current;
    if (v && v.currentTime >= LOOP_SECONDS) v.currentTime = 0;
  }

  const cls = `w-full h-full object-cover ${item.blur !== false ? "blur-[8px] scale-110" : ""}`;

  return (
    <div className="w-24 aspect-[9/16] rounded-xl overflow-hidden bg-neutral-900 shrink-0 relative">
      {item.src ? (
        <video
          ref={videoRef}
          src={item.src}
          muted
          autoPlay
          playsInline
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          className={cls}
        />
      ) : item.thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.thumb} alt="" loading="lazy" className={cls} />
      ) : (
        <div className="w-full h-full bg-neutral-800" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}

function buildRow(items: Item[]): Item[] {
  const base = items.length ? items : [{ src: null, thumb: null }];
  const copies = Math.ceil(12 / base.length);
  const filled = Array.from({ length: copies }, () => base).flat();
  return [...filled, ...filled];
}

export default function LoginScreen({ galleryItems }: { galleryItems: Item[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const rows = useMemo(() => {
    const shuffled = [...galleryItems].sort(() => Math.random() - 0.5);
    return Array.from({ length: ROWS }, (_, i) => {
      const offset = Math.floor((i * shuffled.length) / ROWS);
      const rotated = [...shuffled.slice(offset), ...shuffled.slice(0, offset)];
      return buildRow(rotated);
    });
  }, [galleryItems]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) { setError("E-mail inválido. Verifique e tente novamente."); return; }
    router.refresh();
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#050506] overflow-hidden">
      <div className="text-center shrink-0 pt-10 pb-2 px-6 z-10">
        <Logo className="text-3xl" />
        <p className="text-[12px] text-dim mt-1.5 tracking-wide">Acesso exclusivo · conteúdo +18</p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-2 overflow-hidden gallery-mask min-h-0 py-2">
        {rows.map((items, r) => (
          <div key={r} className={`gal-row ${r % 2 === 0 ? "left" : "right"}`} style={{ animationDuration: `${SPEEDS[r]}s` }}>
            {items.map((item, i) => <GalleryCard key={i} item={item} />)}
          </div>
        ))}
      </div>

      <div className="shrink-0 px-5 pb-8 pt-4 bg-gradient-to-t from-[#050506] via-[#050506]/95 to-transparent">
        <form onSubmit={submit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite o e-mail da sua compra"
            className="w-full bg-white/[0.07] border border-white/15 rounded-2xl px-5 py-[15px] text-[15px] outline-none focus:border-white/35 mb-3"
          />
          {error && <p className="text-accent text-[13px] mb-2 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-[15px] rounded-2xl text-[15px] font-bold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(90deg,#ff1414,#cc0000)", boxShadow: "0 6px 24px rgba(255,0,0,.35)" }}
          >
            {loading ? "Entrando..." : "Acessar conteúdo"}
          </button>
          <p className="text-[11px] text-white/35 mt-3.5 text-center leading-relaxed">
            Conteúdo para <b className="text-white/55">maiores de 18 anos</b>. Ao entrar, você confirma ter 18+.
          </p>
        </form>
      </div>
    </div>
  );
}
