-- =====================================================================
-- DexWish — banco de dados (Supabase / PostgreSQL)
-- Como usar: Supabase > SQL Editor > New query > cole TUDO > Run.
-- Pode rodar de novo sem medo (usa "if not exists" / "or replace").
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- PERFIL (1 linha por usuário do Supabase Auth) ----------
create table if not exists public.perfil (
  id         uuid primary key references auth.users(id) on delete cascade,
  usuario    text,
  email      text,
  avatar_url text,
  criado_em  timestamptz not null default now()
);
create unique index if not exists perfil_usuario_unico on public.perfil (lower(usuario));

-- ---------- CATEGORIA (com subcategoria: id_categoria_pai) ----------
create table if not exists public.categoria (
  id               uuid primary key default gen_random_uuid(),
  id_usuario       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id_categoria_pai uuid references public.categoria(id) on delete cascade,
  nome             text not null check (char_length(trim(nome)) between 1 and 60),
  criado_em        timestamptz not null default now()
);
create index if not exists categoria_usuario_idx on public.categoria (id_usuario);
create index if not exists categoria_pai_idx     on public.categoria (id_categoria_pai);

-- ---------- SELO (só os que o usuário cria; "Concluído" já existe no app) ----------
create table if not exists public.selo (
  id         uuid primary key default gen_random_uuid(),
  id_usuario uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nome       text not null check (char_length(trim(nome)) between 1 and 20),
  criado_em  timestamptz not null default now(),
  unique (id_usuario, nome)
);

-- ---------- ITEM (o desejo) ----------
create table if not exists public.item (
  id           uuid primary key default gen_random_uuid(),
  id_usuario   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id_categoria uuid references public.categoria(id) on delete set null,
  nome         text not null check (char_length(trim(nome)) between 1 and 120),
  descricao    text,
  prioridade   text not null default 'media' check (prioridade in ('alta','media','baixa')),
  preco        numeric(12,2) check (preco is null or preco >= 0),
  link         text,
  imagem_url   text,
  concluido    boolean not null default false,
  selo         text,
  nota         smallint check (nota between 1 and 5),
  comentario   text,
  concluido_em timestamptz,
  excluido_em  timestamptz,           -- exclusão "suave": permite Desfazer
  criado_em    timestamptz not null default now()
);
create index if not exists item_usuario_idx   on public.item (id_usuario);
create index if not exists item_categoria_idx on public.item (id_categoria);

-- ---------- SEGURANÇA (RLS): cada pessoa só vê e mexe nos próprios dados ----------
alter table public.perfil    enable row level security;
alter table public.categoria enable row level security;
alter table public.selo      enable row level security;
alter table public.item      enable row level security;

drop policy if exists "perfil_ler"       on public.perfil;
drop policy if exists "perfil_atualizar" on public.perfil;
create policy "perfil_ler"       on public.perfil for select using (id = auth.uid());
create policy "perfil_atualizar" on public.perfil for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "categoria_dono" on public.categoria;
drop policy if exists "selo_dono"      on public.selo;
drop policy if exists "item_dono"      on public.item;
create policy "categoria_dono" on public.categoria for all using (id_usuario = auth.uid()) with check (id_usuario = auth.uid());
create policy "selo_dono"      on public.selo      for all using (id_usuario = auth.uid()) with check (id_usuario = auth.uid());
create policy "item_dono"      on public.item      for all using (id_usuario = auth.uid()) with check (id_usuario = auth.uid());

-- ---------- CRIA O PERFIL AUTOMATICAMENTE quando alguém se cadastra / entra ----------
create or replace function public.novo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
declare nome text;
begin
  nome := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'usuario'), ''),
    case when new.is_anonymous then null else nullif(split_part(coalesce(new.email, ''), '@', 1), '') end
  );
  begin
    insert into public.perfil (id, usuario, email) values (new.id, nome, new.email);
  exception when unique_violation then
    insert into public.perfil (id, usuario, email) values (new.id, nome || '_' || substr(new.id::text, 1, 4), new.email);
  end;
  return new;
end $$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario after insert on auth.users
  for each row execute function public.novo_usuario();

-- ---------- FUNÇÕES usadas pelo login ----------
-- O app deixa entrar por "nome de usuário": descobrimos o e-mail dele aqui.
create or replace function public.email_do_usuario(p_usuario text) returns text
language sql security definer stable set search_path = public as $$
  select email from public.perfil where lower(usuario) = lower(trim(p_usuario)) limit 1
$$;

create or replace function public.usuario_disponivel(p_usuario text) returns boolean
language sql security definer stable set search_path = public as $$
  select not exists (select 1 from public.perfil where lower(usuario) = lower(trim(p_usuario)))
$$;

grant execute on function public.email_do_usuario(text)  to anon, authenticated;
grant execute on function public.usuario_disponivel(text) to anon, authenticated;

-- ---------- ARMAZENAMENTO de imagens (fotos dos desejos e do perfil) ----------
insert into storage.buckets (id, name, public) values ('imagens', 'imagens', true)
on conflict (id) do nothing;

drop policy if exists "imagens_ver"      on storage.objects;
drop policy if exists "imagens_enviar"   on storage.objects;
drop policy if exists "imagens_trocar"   on storage.objects;
drop policy if exists "imagens_apagar"   on storage.objects;
create policy "imagens_ver"    on storage.objects for select using (bucket_id = 'imagens');
create policy "imagens_enviar" on storage.objects for insert to authenticated
  with check (bucket_id = 'imagens' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "imagens_trocar" on storage.objects for update to authenticated
  using (bucket_id = 'imagens' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "imagens_apagar" on storage.objects for delete to authenticated
  using (bucket_id = 'imagens' and (storage.foldername(name))[1] = auth.uid()::text);
