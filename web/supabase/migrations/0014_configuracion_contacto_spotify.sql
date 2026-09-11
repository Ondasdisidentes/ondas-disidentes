-- =========================================================
-- Ondas Disidentes ya no usa SoundCloud: reemplaza esa columna por
-- Spotify en la configuración de contacto (footer y menú del sitio
-- público). Ver 0011_configuracion_contacto.sql.
-- =========================================================

alter table public.configuracion_contacto
  rename column soundcloud to spotify;

-- El tipo de contenido "soundcloud" de los episodios (link externo, ver
-- 0001_admin_schema.sql, columna `episodios.contenido` jsonb) también pasa
-- a llamarse "spotify". Actualiza los episodios existentes que ya tengan
-- ese tipo para que sigan reproduciéndose con el código nuevo.
update public.episodios
set contenido = jsonb_set(contenido, '{tipo}', '"spotify"')
where contenido ->> 'tipo' = 'soundcloud';
