# TKTK P🔞RN — feed de vídeos pago (estilo TikTok)

Feed vertical de vídeos com login por e-mail, like/comentário/compartilhar, paywall para não-compradores, painel admin e liberação automática de acesso via webhook da Kirvano. Vídeo via **Bunny Stream** (streaming adaptativo, leve em internet ruim).

## Rodar localmente (modo demo)

Sem nenhuma variável de ambiente, o app roda em **modo demo** com vídeos de amostra e dados em memória:

```bash
npm install
npm run dev
```

Abra http://localhost:3000

- **Login:** qualquer e-mail entra. E-mails com **"vip"** ou **"pago"** simulam comprador (acesso total); os demais batem no paywall após `FREE_LIMIT` vídeos.
- **Admin:** http://localhost:3000/admin — senha padrão `admin` (em produção use `ADMIN_PASSWORD`).

## Configurar produção

Copie `.env.example` para `.env.local` e preencha:

### 1. Supabase (banco)
1. Crie um projeto em supabase.com.
2. SQL Editor → cole e rode `supabase/schema.sql`.
3. Settings → API → copie `URL`, `anon key` e `service_role key` para o `.env.local`.

### 2. Bunny Stream (vídeos)
1. Crie um **Stream Library** no painel da Bunny.
2. Pegue o hostname da Pull Zone (ex: `vz-xxxx.b-cdn.net`) → `BUNNY_CDN_HOSTNAME`.
3. Faça upload dos vídeos; cada vídeo tem um **GUID** (ID). É esse ID que você cola no painel `/admin`.
4. As URLs de HLS/thumbnail são montadas automaticamente em `lib/bunny.ts`.

### 3. Kirvano (pagamento → libera acesso)
1. No painel da Kirvano, configure um **webhook** apontando para:
   `https://SEU_DOMINIO/api/webhooks/kirvano`
2. Defina um token/secret e coloque o mesmo valor em `KIRVANO_WEBHOOK_SECRET`.
   O webhook aceita o secret via header `security-token` / `x-kirvano-token` ou query `?secret=`.
3. Eventos de venda aprovada liberam o e-mail; reembolso/chargeback revogam.

### 4. Sessão / Admin
- `SESSION_SECRET`: string aleatória longa (assina o cookie de login).
- `ADMIN_PASSWORD`: senha do painel `/admin`.
- `NEXT_PUBLIC_CHECKOUT_URL`: link do checkout (botão do paywall).

## Estrutura
- `app/` — páginas e API routes (login, vídeos, likes, comentários, webhook, admin).
- `app/feed/` — feed vertical e componentes (slide, comentários, share, paywall).
- `app/login/` — tela de login com galeria.
- `app/admin/` — painel para cadastrar vídeos.
- `lib/` — dados (`db.ts`), sessão, bunny, supabase, config.
- `supabase/schema.sql` — schema do banco.

## Observações
- **Login sem verificação:** quem souber um e-mail comprador consegue entrar. Para reforçar, considere depois um código por e-mail.
- **Conteúdo adulto:** o Bunny permite; confirme que o host do *site* (ex: Vercel) também permite seu conteúdo antes de publicar.
- **Performance:** só o vídeo visível (±1) é montado e reproduzido; HLS adaptativo ajusta a qualidade à conexão.
