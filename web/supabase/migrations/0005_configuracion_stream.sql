-- =========================================================
-- Ondas Disidentes — configuración del stream de giss.tv,
-- editable desde /admin/stream en vez de variables de entorno
-- =========================================================

-- Tabla singleton (siempre una sola fila, id fijo en `true`) — patrón
-- estándar de Postgres para tablas de configuración de una sola fila.
create table public.configuracion_stream (
  id boolean primary key default true,
  status_url text not null default '',
  mount text not null default '',
  stream_url text not null default '',
  updated_at timestamptz not null default now(),
  constraint configuracion_stream_singleton check (id)
);

insert into public.configuracion_stream (id, status_url, mount, stream_url)
values (
  true,
  'https://giss.tv:667/status-json.xsl',
  '/OndasDisidentes.mp3',
  'https://giss.tv:667/OndasDisidentes.mp3'
);

alter table public.configuracion_stream enable row level security;

-- Lectura pública: la usa /api/icecast-status (server-side) y el
-- reproductor en vivo del sitio, no son datos sensibles.
create policy "configuracion_stream_select_public"
  on public.configuracion_stream
  for select
  to anon, authenticated
  using (true);

-- Solo el admin puede modificarla. No hay policy de insert/delete porque
-- la fila única se crea acá mismo, en la migración — el sitio solo actualiza.
create policy "configuracion_stream_update_admin"
  on public.configuracion_stream
  for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com')
  with check ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');
