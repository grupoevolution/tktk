"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/icons";

type Item = { src: string | null; thumb: string | null };

const ROWS = 3;
const SPEEDS = [62, 80, 70]; // segundos por fileira (todas lentas, diferentes entre si)

function shuffle<T>(arr: T[]): T[] {
  return arr
    .map((v) => [Math.random(), v] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v);
}

function GalleryCard({ item, blur }: { item: Item; blur: boolean }) {
  const cls = `w-full h-full object-cover ${blur ? "blur-[6px] scale-110" : ""}`;
  return (
    <div className="w-24 aspect-[9/16] rounded-xl overflow-hidden bg-neutral-900 shrink-0 relative">
      {item.thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.thumb} alt="" className={cls} />
      ) : item.src ? (
        <video src={item.src} muted loop autoPlay playsInline preload="metadata" className={cls} />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
    </div>
  );
}

export default function LoginScreen({
  loginBlur,
  galleryItems,
}: {
  loginBlur: boolean;
  galleryItems: Item[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const rows = useMemo(() => {
    const base = galleryItems.length ? galleryItems : [{ src: null, thumb: null }];
    return Array.from({ length: ROWS }, () => {
      const s = shuffle(base);
      // repete para preencher a largura e permitir loop contínuo
      return [...s, ...s, ...s, ...s];
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
    if (!res.ok) {
      setError("E-mail inválido. Verifique e tente novamente.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="fixed inset-0 flex flex-col justify-between px-6 pt-14 pb-8 bg-[#050506] overflow-hidden">
      <div className="text-center shrink-0">
        <Logo className="text-3xl" />
        <p className="text-[12.5px] text-dim mt-2 tracking-wide">Acesso exclusivo · conteúdo +18</p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-2 my-4 overflow-hidden gallery-mask">
        {rows.map((items, r) => (
          <div
            key={r}
            className={`gal-row ${r % 2 === 0 ? "left" : "right"}`}
            style={{ animationDuration: `${SPEEDS[r]}s` }}
          >
            {items.map((item, i) => (
              <GalleryCard key={i} item={item} blur={loginBlur} />
            ))}
          </div>
        ))}
      </div>

      <form className="shrink-0" onSubmit={submit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite o e-mail da sua compra"
          className="w-full bg-white/[0.06] border border-white/15 rounded-2xl px-5 py-4 text-[15px] outline-none focus:border-accent/60 mb-3"
        />
        {error && <p className="text-accent text-[13px] mb-2 text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl text-[15px] font-bold text-white disabled:opacity-60"
          style={{ background: "linear-gradient(90deg,#ff1414,#cc0000)", boxShadow: "0 8px 28px rgba(255,0,0,.3)" }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <p className="text-[11px] text-white/40 mt-4 text-center leading-relaxed">
          Conteúdo destinado a <b className="text-white/70">maiores de 18 anos</b>.
          <br />
          Ao entrar, você confirma ter 18+.
        </p>
      </form>
    </div>
  );
}
