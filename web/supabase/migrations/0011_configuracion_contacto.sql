-- =========================================================
-- Ondas Disidentes — datos de contacto (email, teléfono, redes),
-- editables desde /admin/contacto. Se usan en el footer y en el
-- menú hamburguesa del sitio público. Cualquier campo puede
-- quedar vacío: el admin "elimina" un hipervínculo dejándolo en
-- blanco, y el sitio simplemente no lo muestra.
-- =========================================================

-- Tabla singleton (siempre una sola fila, id fijo en `true`) — mismo
-- patrón que configuracion_stream.
create table public.configuracion_contacto (
  id boolean primary key default true,
  email text,
  telefono text,
  instagram text,
  facebook text,
  soundcloud text,
  updated_at timestamptz not null default now(),
  constraint configuracion_contacto_singleton check (id)
);

insert into public.configuracion_contacto (id) values (true);

alter table public.configuracion_contacto enable row level security;

-- Lectura pública: la usa el footer y el menú hamburguesa del sitio,
-- no son datos sensibles.
create policy "configuracion_contacto_select_public"
  on public.configuracion_contacto
  for select
  to anon, authenticated
  using (true);

-- Solo el admin puede modificarla. No hay policy de insert/delete porque
-- la fila única se crea acá mismo, en la migración — el sitio solo actualiza.
create policy "configuracion_contacto_update_admin"
  on public.configuracion_contacto
  for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com')
  with check ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');
