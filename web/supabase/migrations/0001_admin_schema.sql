-- =========================================================
-- Ondas Disidentes — admin schema, RLS, and login rate limiting
-- =========================================================

-- ---------- programas ----------
create table public.programas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text not null default '',
  icono text not null,
  created_at timestamptz not null default now()
);

alter table public.programas enable row level security;

create policy "programas_select_public"
  on public.programas
  for select
  to anon, authenticated
  using (true);

create policy "programas_insert_admin"
  on public.programas
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

create policy "programas_update_admin"
  on public.programas
  for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com')
  with check ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

create policy "programas_delete_admin"
  on public.programas
  for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

-- ---------- episodios ----------
create table public.episodios (
  id uuid primary key default gen_random_uuid(),
  programa_id uuid not null references public.programas(id) on delete cascade,
  nombre text not null,
  descripcion text not null default '',
  duracion text not null default '',
  contenido jsonb not null,
  created_at timestamptz not null default now()
);

create index episodios_programa_id_idx on public.episodios(programa_id);

alter table public.episodios enable row level security;

create policy "episodios_select_public"
  on public.episodios
  for select
  to anon, authenticated
  using (true);

create policy "episodios_insert_admin"
  on public.episodios
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

create policy "episodios_update_admin"
  on public.episodios
  for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com')
  with check ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

create policy "episodios_delete_admin"
  on public.episodios
  for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

-- ---------- login rate limiting ----------
create table public.login_intentos (
  id bigint generated always as identity primary key,
  identificador text not null,
  creado_en timestamptz not null default now()
);

create index login_intentos_identificador_creado_en_idx
  on public.login_intentos (identificador, creado_en desc);

alter table public.login_intentos enable row level security;

-- INSERT-only for anon/authenticated. No SELECT/UPDATE/DELETE policy exists
-- for those roles, so rows can never be read or tampered with from the
-- client — only counted, via the security-definer function below.
create policy "login_intentos_insert_any"
  on public.login_intentos
  for insert
  to anon, authenticated
  with check (true);

create or replace function public.intentos_recientes(p_identificador text, p_minutos integer)
returns integer
language sql
security definer
set search_path = ''
as $$
  select count(*)::integer
  from public.login_intentos
  where identificador = p_identificador
    and creado_en > now() - (p_minutos || ' minutes')::interval;
$$;

revoke all on function public.intentos_recientes(text, integer) from public;
grant execute on function public.intentos_recientes(text, integer) to anon, authenticated;
