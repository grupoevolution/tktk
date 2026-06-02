"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/icons";

type Item = { src: string | null; thumb: string | null; blur: boolean };

const ROWS = 3;
const SPEEDS = [28, 38, 32]; // segundos — mais rápido e diferente entre fileiras

function GalleryCard({ item }: { item: Item }) {
  const cls = `w-full h-full object-cover ${item.blur ? "blur-[8px] scale-110" : ""}`;
  return (
    <div className="w-24 aspect-[9/16] rounded-xl overflow-hidden bg-neutral-900 shrink-0 relative">
      {item.thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.thumb} alt="" className={cls} />
      ) : item.src ? (
        <video src={item.src} muted loop autoPlay playsInline preload="metadata" className={cls} />
      ) : (
        <div className="w-full h-full bg-neutral-800" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}

// Gera fileiras com itens repetidos o suficiente para o loop ser seamless
function buildRow(items: Item[]): Item[] {
  const base = items.length ? items : [{ src: null, thumb: null, blur: false }];
  // repete até ter pelo menos 12 itens, depois duplica para o loop
  const copies = Math.ceil(12 / base.length);
  const filled = Array.from({ length: copies }, () => base).flat();
  return [...filled, ...filled]; // dobra: primeira metade visível, segunda cria o loop
}

export default function LoginScreen({
  galleryItems,
}: {
  galleryItems: Item[];
}) {
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
              <GalleryCard key={i} item={item} />
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
