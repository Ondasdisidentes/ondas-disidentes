-- =========================================================
-- Ondas Disidentes — Storage para el audio real de los episodios
-- =========================================================
-- El bucket 'episodios-audio' en sí se crea aparte, vía dashboard/API
-- (public:true) — mismo criterio que el bucket 'panelistas' en
-- 0003_panelistas.sql. Esta migración solo agrega las policies de RLS.

create policy "episodios_audio_storage_select_public"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'episodios-audio');

create policy "episodios_audio_storage_insert_admin"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'episodios-audio' and (auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

create policy "episodios_audio_storage_update_admin"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'episodios-audio' and (auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com')
  with check (bucket_id = 'episodios-audio' and (auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

create policy "episodios_audio_storage_delete_admin"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'episodios-audio' and (auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');
