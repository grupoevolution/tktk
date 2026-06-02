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

const emptyForm = {
  caption: "",
  creatorName: "",
  bunnyVideoId: "",
  hlsUrl: "",
  thumbnailUrl: "",
  published: true,
  showInLogin: false,
  blurInLogin: true,
};

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-dim cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-red-500 w-4 h-4" />
      {label}
    </label>
  );
}

function AdminPanel() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/videos");
    if (res.ok) setVideos((await res.json()).videos || []);
  }
  useEffect(() => { load(); }, []);

  function startEdit(v: Video) {
    setEditId(v.id);
    setForm({
      caption: v.caption,
      creatorName: v.creatorName,
      bunnyVideoId: v.bunnyVideoId || "",
      hlsUrl: v.hlsUrl || "",
      thumbnailUrl: v.thumbnailUrl || "",
      published: v.published,
      showInLogin: v.showInLogin,
      blurInLogin: v.blurInLogin,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditId(null);
    setForm({ ...emptyForm });
    setError("");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const method = editId ? "PATCH" : "POST";
    const body = editId ? { id: editId, ...form } : form;
    const res = await fetch("/api/admin/videos", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) { cancelEdit(); load(); }
    else setError((await res.json()).error || "Erro ao salvar");
  }

  async function remove(id: string) {
    if (!confirm("Remover este vídeo?")) return;
    await fetch("/api/admin/videos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (editId === id) cancelEdit();
    load();
  }

  async function toggleField(v: Video, field: "published" | "showInLogin" | "blurInLogin") {
    await fetch("/api/admin/videos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: v.id, [field]: !v[field] }),
    });
    load();
  }

  const f = (k: keyof typeof form, val: unknown) => setForm((p) => ({ ...p, [k]: val }));

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <header className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-[#0a0a0b]/90 backdrop-blur z-10">
        <Logo className="text-base" />
        <span className="text-dim text-sm">Admin · {videos.length} vídeos</span>
      </header>

      <div className="max-w-2xl mx-auto p-5 grid gap-6">
        <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
          <h2 className="font-semibold mb-4">{editId ? "Editar vídeo" : "Novo vídeo"}</h2>
          <form onSubmit={save} className="grid gap-3">
            <input
              value={form.creatorName}
              onChange={(e) => f("creatorName", e.target.value)}
              placeholder="Nome do creator *"
              className="bg-white/[0.06] border border-white/12 rounded-xl px-4 py-3 text-sm outline-none"
            />
            <input
              value={form.caption}
              onChange={(e) => f("caption", e.target.value)}
              placeholder="Legenda"
              className="bg-white/[0.06] border border-white/12 rounded-xl px-4 py-3 text-sm outline-none"
            />

            <div className="border border-white/8 rounded-xl p-4 grid gap-2">
              <p className="text-xs text-dim mb-1">Vídeo — preencha um dos dois:</p>
              <input
                value={form.bunnyVideoId}
                onChange={(e) => f("bunnyVideoId", e.target.value)}
                placeholder="ID do vídeo no Bunny Stream"
                className="bg-white/[0.06] border border-white/12 rounded-xl px-4 py-3 text-sm outline-none"
              />
              <input
                value={form.hlsUrl}
                onChange={(e) => f("hlsUrl", e.target.value)}
                placeholder="URL direta do vídeo (.m3u8 ou .mp4)"
                className="bg-white/[0.06] border border-white/12 rounded-xl px-4 py-3 text-sm outline-none"
              />
              <input
                value={form.thumbnailUrl}
                onChange={(e) => f("thumbnailUrl", e.target.value)}
                placeholder="URL da thumbnail (opcional)"
                className="bg-white/[0.06] border border-white/12 rounded-xl px-4 py-3 text-sm outline-none"
              />
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <Check label="Publicado no feed" checked={form.published} onChange={(v) => f("published", v)} />
              <Check label="Mostrar na tela de login" checked={form.showInLogin} onChange={(v) => f("showInLogin", v)} />
              {form.showInLogin && (
                <Check label="Embaçar no login" checked={(form as any).blurInLogin} onChange={(v) => f("blurInLogin", v)} />
              )}
            </div>

            {error && <p className="text-accent text-[13px]">{error}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-60"
                style={{ background: "linear-gradient(90deg,#ff0d0d,#ff4d4d)" }}
              >
                {saving ? "Salvando..." : editId ? "Salvar alterações" : "Adicionar vídeo"}
              </button>
              {editId && (
                <button type="button" onClick={cancelEdit} className="px-5 py-3 rounded-xl border border-white/15 text-sm text-dim">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="grid gap-2">
          <h2 className="font-semibold mb-1">Vídeos cadastrados</h2>
          {videos.length === 0 && <p className="text-dim text-sm">Nenhum vídeo ainda.</p>}
          {videos.map((v) => (
            <div key={v.id} className={`bg-white/[0.03] border rounded-xl p-3 grid gap-2 ${editId === v.id ? "border-accent/40" : "border-white/10"}`}>
              <div className="flex items-start gap-3">
                {v.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.thumbnailUrl} alt="" className="w-10 aspect-[9/16] object-cover rounded-lg shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{v.creatorName || "(sem nome)"}</div>
                  <div className="text-dim text-xs truncate mt-0.5">{v.caption || "sem legenda"}</div>
                  <div className="text-white/30 text-xs mt-1">❤ {v.baseLikes + v.likes} · 💬 {v.commentsCount}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => toggleField(v, "published")}
                  className={`text-xs px-3 py-1 rounded-full border transition ${v.published ? "border-green-500/40 text-green-400 bg-green-500/10" : "border-white/20 text-dim"}`}
                >
                  {v.published ? "✓ No feed" : "Oculto do feed"}
                </button>
                <button
                  onClick={() => toggleField(v, "showInLogin")}
                  className={`text-xs px-3 py-1 rounded-full border transition ${v.showInLogin ? "border-blue-400/40 text-blue-400 bg-blue-500/10" : "border-white/20 text-dim"}`}
                >
                  {v.showInLogin ? "✓ No login" : "Oculto do login"}
                </button>
                {v.showInLogin && (
                  <button
                    onClick={() => toggleField(v, "blurInLogin")}
                    className={`text-xs px-3 py-1 rounded-full border transition ${v.blurInLogin ? "border-yellow-400/40 text-yellow-400 bg-yellow-500/10" : "border-white/20 text-dim"}`}
                  >
                    {v.blurInLogin ? "Embaçado" : "Sem blur"}
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => startEdit(v)} className="flex-1 text-xs py-1.5 rounded-lg border border-white/15 text-dim">
                  Editar
                </button>
                <button onClick={() => remove(v.id)} className="text-xs px-4 py-1.5 rounded-lg border border-accent/40 text-accent">
                  Remover
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
