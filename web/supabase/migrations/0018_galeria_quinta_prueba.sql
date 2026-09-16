-- =========================================================
-- Ondas Disidentes — quinta foto de prueba en la galería, para ver cómo se
-- ve el carrusel con 5 imágenes (antes solo tenía 4). Mismo mecanismo que
-- 0017_galeria_carrusel.sql: se toma de radialistas, que ya tiene 8 filas
-- cargadas — usamos la 5ª (offset 4), que todavía no está en la galería.
-- =========================================================

insert into public.galeria_imagenes (nombre, url, storage_path)
select nombre || ' (foto de radialista, prueba)', foto_url, null
from public.radialistas
order by created_at asc
offset 4
limit 1;
