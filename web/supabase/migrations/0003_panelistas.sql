-- =========================================================
-- Ondas Disidentes — "El equipo" (panelistas): tabla + Storage
-- =========================================================

create table public.panelistas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  puesto text not null default '',
  foto_url text not null,
  created_at timestamptz not null default now()
);

alter table public.panelistas enable row level security;

create policy "panelistas_select_public"
  on public.panelistas
  for select
  to anon, authenticated
  using (true);

create policy "panelistas_insert_admin"
  on public.panelistas
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

create policy "panelistas_update_admin"
  on public.panelistas
  for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com')
  with check ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

create policy "panelistas_delete_admin"
  on public.panelistas
  for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

-- ---------- Storage: bucket público 'panelistas' ----------
-- El bucket en sí (creado aparte vía API con public:true) solo habilita
-- lectura anónima de objetos. Sin estas policies, cualquiera con la anon key
-- podría subir/borrar archivos ahí — mismo criterio que las tablas de arriba.

create policy "panelistas_storage_select_public"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'panelistas');

create policy "panelistas_storage_insert_admin"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'panelistas' and (auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

create policy "panelistas_storage_update_admin"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'panelistas' and (auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com')
  with check (bucket_id = 'panelistas' and (auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

create policy "panelistas_storage_delete_admin"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'panelistas' and (auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');
