-- =========================================================
-- Ondas Disidentes — galería de imágenes, editable desde /admin/estilos
-- (tab "Galería"). Por ahora solo se cargan y listan desde el admin; dónde
-- se usan en el sitio público se define después.
-- =========================================================
-- El bucket 'galeria' en sí se crea aparte, vía dashboard/API (public:true)
-- — mismo criterio que 'programas' (0013), 'episodios-audio' (0007) y
-- 'panelistas' (0003). Esta migración crea la tabla y las policies de RLS,
-- tanto de la tabla como del bucket.

create table public.galeria_imagenes (
  id uuid primary key default gen_random_uuid(),
  -- Nombre original del archivo subido, tal cual para identificarlo en la
  -- tabla del admin. El nombre real en Storage es un UUID (storage_path),
  -- así que este campo es solo para mostrar.
  nombre text not null,
  url text not null,
  storage_path text not null,
  creado_en timestamptz not null default now()
);

alter table public.galeria_imagenes enable row level security;

-- Lectura pública: en algún momento se van a usar en el sitio, no son datos
-- sensibles — mismo criterio que el resto de las tablas de configuración.
create policy "galeria_imagenes_select_public"
  on public.galeria_imagenes
  for select
  to anon, authenticated
  using (true);

-- Solo insert/delete (no hay edición in place: una imagen se sube o se
-- borra, no se "actualiza").
create policy "galeria_imagenes_insert_admin"
  on public.galeria_imagenes
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

create policy "galeria_imagenes_delete_admin"
  on public.galeria_imagenes
  for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

-- Storage del bucket 'galeria' — mismo patrón que programas_storage_* (0013).
create policy "galeria_storage_select_public"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'galeria');

create policy "galeria_storage_insert_admin"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'galeria' and (auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

create policy "galeria_storage_delete_admin"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'galeria' and (auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');
