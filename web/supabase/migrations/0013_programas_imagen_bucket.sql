-- =========================================================
-- Ondas Disidentes — Storage para la imagen de portada subida de cada
-- programa (reemplaza el selector de ilustraciones predefinidas)
-- =========================================================
-- El bucket 'programas' en sí se crea aparte, vía dashboard/API
-- (public:true) — mismo criterio que 'panelistas' (0003) y
-- 'episodios-audio' (0007). Esta migración solo agrega las policies de RLS.

create policy "programas_storage_select_public"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'programas');

create policy "programas_storage_insert_admin"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'programas' and (auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

create policy "programas_storage_update_admin"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'programas' and (auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com')
  with check (bucket_id = 'programas' and (auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

create policy "programas_storage_delete_admin"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'programas' and (auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');
