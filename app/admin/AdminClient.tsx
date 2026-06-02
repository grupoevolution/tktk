"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Video } from "@/lib/types";
import { Logo } from "@/components/icons";

export default function AdminClient({ authed }: { authed: boolean }) {
  if (!authed) return <AdminLogin />;
  return <AdminPanel />;
}

function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) router.refresh();
    else setError("Senha incorreta.");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#050506]">
      <Logo className="text-2xl mb-1" />
      <p className="text-dim text-sm mb-7">Painel de administração</p>
      <form onSubmit={submit} className="w-full max-w-sm">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha do admin"
          className="w-full bg-white/[0.06] border border-white/15 rounded-2xl px-5 py-4 text-[15px] outline-none mb-3"
        />
        {error && <p className="text-accent text-[13px] mb-2 text-center">{error}</p>}
        <button type="submit" className="w-full py-4 rounded-2xl text-[15px] font-bold bg-white/10 border border-white/15">
          Entrar
        </button>
      </form>
    </div>
  );
}

const empty = { caption: "", creatorName: "", bunnyVideoId: "", hlsUrl: "", position: 0, published: true };

function AdminPanel() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/videos");
    if (res.ok) setVideos((await res.json()).videos || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/admin/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setForm({ ...empty });
      load();
    } else {
      setError((await res.json()).error || "Erro ao salvar");
    }
  }

  async function remove(id: string) {
    if (!confirm("Remover este vídeo?")) return;
    await fetch("/api/admin/videos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  async function togglePublish(v: Video) {
    await fetch("/api/admin/videos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: v.id, published: !v.published }),
    });
    load();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <header className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-[#0a0a0b]/90 backdrop-blur z-10">
        <Logo className="text-base" />
        <span className="text-dim text-sm">Admin</span>
      </header>

      <div className="max-w-2xl mx-auto p-5 grid gap-6">
        {/* Form novo vídeo */}
        <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Novo vídeo</h2>
          <form onSubmit={add} className="grid gap-3">
            <input
              value={form.creatorName}
              onChange={(e) => setForm({ ...form, creatorName: e.target.value })}
              placeholder="Nome do creator"
              className="bg-white/[0.06] border border-white/12 rounded-xl px-4 py-3 text-sm outline-none"
            />
            <input
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              placeholder="Legenda"
              className="bg-white/[0.06] border border-white/12 rounded-xl px-4 py-3 text-sm outline-none"
            />
            <input
              value={form.bunnyVideoId}
              onChange={(e) => setForm({ ...form, bunnyVideoId: e.target.value })}
              placeholder="ID do vídeo no Bunny Stream"
              className="bg-white/[0.06] border border-white/12 rounded-xl px-4 py-3 text-sm outline-none"
            />
            <input
              value={form.hlsUrl}
              onChange={(e) => setForm({ ...form, hlsUrl: e.target.value })}
              placeholder="OU URL direta do vídeo (.m3u8 ou .mp4)"
              className="bg-white/[0.06] border border-white/12 rounded-xl px-4 py-3 text-sm outline-none"
            />
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
                placeholder="Ordem"
                className="bg-white/[0.06] border border-white/12 rounded-xl px-4 py-3 text-sm outline-none w-28"
              />
              <label className="flex items-center gap-2 text-sm text-dim">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                Publicado
              </label>
            </div>
            {error && <p className="text-accent text-[13px]">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="py-3 rounded-xl font-bold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(90deg,#ff0d0d,#ff4d4d)" }}
            >
              {saving ? "Salvando..." : "Adicionar vídeo"}
            </button>
          </form>
        </section>

        {/* Lista */}
        <section className="grid gap-2">
          <h2 className="font-semibold mb-1">Vídeos ({videos.length})</h2>
          {videos.length === 0 && <p className="text-dim text-sm">Nenhum vídeo cadastrado ainda.</p>}
          {videos.map((v) => (
            <div key={v.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{v.creatorName || "(sem nome)"}</div>
                <div className="text-dim text-xs truncate">
                  #{v.position} · {v.caption || "sem legenda"} · ❤{v.likes} · 💬{v.commentsCount}
                </div>
              </div>
              <button
                onClick={() => togglePublish(v)}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  v.published ? "border-green-500/40 text-green-400" : "border-white/20 text-dim"
                }`}
              >
                {v.published ? "Publicado" : "Oculto"}
              </button>
              <button onClick={() => remove(v.id)} className="text-xs px-3 py-1.5 rounded-full border border-accent/40 text-accent">
                Remover
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
