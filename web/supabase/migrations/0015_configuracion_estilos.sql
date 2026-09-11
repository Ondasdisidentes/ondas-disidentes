-- =========================================================
-- Ondas Disidentes — configuración de estilos del sitio, editable desde
-- /admin/estilos. Arranca con un solo campo: las frases de la cinta que
-- se mueve debajo del hero de la home (antes hardcodeadas en
-- home-client.tsx). Mismo patrón singleton que configuracion_stream y
-- configuracion_contacto.
-- =========================================================

create table public.configuracion_estilos (
  id boolean primary key default true,
  -- Frases de la cinta, una por línea (se separan con "\n" y se repiten
  -- en bucle en el front, intercaladas con "●" — ver TICKER_FRASES en
  -- home-client.tsx).
  ticker_texto text not null default '',
  updated_at timestamptz not null default now(),
  constraint configuracion_estilos_singleton check (id)
);

insert into public.configuracion_estilos (id, ticker_texto)
values (true, 'Al aire por internet' || chr(10) || 'En castellano y en quechua.');

alter table public.configuracion_estilos enable row level security;

-- Lectura pública: la usa la cinta de la home, no es un dato sensible.
create policy "configuracion_estilos_select_public"
  on public.configuracion_estilos
  for select
  to anon, authenticated
  using (true);

-- Solo el admin puede modificarla. No hay policy de insert/delete porque
-- la fila única se crea acá mismo, en la migración — el sitio solo actualiza.
create policy "configuracion_estilos_update_admin"
  on public.configuracion_estilos
  for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com')
  with check ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');
