-- =========================================================
-- Ondas Disidentes — carrusel de la galería en la home (entre la cinta y
-- "Últimos episodios"): modo configurable desde /admin/estilos y datos de
-- prueba mientras se cargan fotos reales.
-- =========================================================

-- Modo del carrusel: "auto" (se mueve solo, mucho más lento que la cinta) o
-- "manual" (flechas + puntos de posición) — ver GaleriaModo en
-- src/lib/estilos.ts.
alter table public.configuracion_estilos
  add column galeria_modo text not null default 'auto';

alter table public.configuracion_estilos
  add constraint configuracion_estilos_galeria_modo_check
  check (galeria_modo in ('auto', 'manual'));

-- storage_path nulo = la fila no es dueña de un archivo en el bucket
-- 'galeria' (caso de las fotos de prueba de abajo, que en realidad viven en
-- el bucket 'panelistas' vía la tabla radialistas) — eliminarImagenGaleria
-- no intenta borrar Storage para esas filas, solo la fila.
alter table public.galeria_imagenes
  alter column storage_path drop not null;

-- Datos de prueba: hasta 4 fotos de radialistas ya cargadas, para ver el
-- carrusel funcionando antes de subir fotos propias a la galería. Se puede
-- borrar cada fila de prueba desde /admin/estilos como cualquier otra.
insert into public.galeria_imagenes (nombre, url, storage_path)
select nombre || ' (foto de radialista, prueba)', foto_url, null
from public.radialistas
order by created_at asc
limit 4;
