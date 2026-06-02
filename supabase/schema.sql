-- Schema do TKTK P🔞RN — rode no SQL Editor do Supabase.

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  caption text default '',
  creator_name text not null default '',
  bunny_video_id text,
  hls_url text,
  thumbnail_url text,
  position int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists videos_position_idx on videos (position);

create table if not exists buyers (
  email text primary key,
  status text not null default 'active', -- 'active' | 'refunded'
  kirvano_order_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references videos(id) on delete cascade,
  user_email text not null,
  created_at timestamptz not null default now(),
  unique (video_id, user_email)
);
create index if not exists likes_video_idx on likes (video_id);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references videos(id) on delete cascade,
  user_email text not null,
  author_name text not null,
  text text not null,
  created_at timestamptz not null default now()
);
create index if not exists comments_video_idx on comments (video_id);

-- O acesso ao banco é feito pela service role (server-side), então o RLS
-- pode ficar habilitado sem políticas públicas. A service role ignora o RLS.
alter table videos enable row level security;
alter table buyers enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;
