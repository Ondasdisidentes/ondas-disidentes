-- One-time seed: migrates the 3 example programs/episodes that were
-- hardcoded in web/src/lib/programas.ts (PROGRAMAS_EJEMPLO) into real rows,
-- so the public homepage looks identical after the switch to the DB.
-- Not idempotent by design — run exactly once.

do $$
declare
  v_id uuid;
begin
  insert into public.programas (titulo, descripcion, icono)
  values ('Cuerpo Político', 'Derechos reproductivos desde el sur global.', '/images/episode-01.webp')
  returning id into v_id;

  insert into public.episodios (programa_id, nombre, descripcion, duracion, contenido)
  values (v_id, 'Cuerpo Político', 'Derechos reproductivos desde el sur global.', '45 min',
          jsonb_build_object('tipo', 'archivo', 'nombreArchivo', ''));

  insert into public.programas (titulo, descripcion, icono)
  values ('Territorio Frecuencia', 'Activistas y radialistas de Bolivia.', '/images/episode-02.webp')
  returning id into v_id;

  insert into public.episodios (programa_id, nombre, descripcion, duracion, contenido)
  values (v_id, 'Territorio Frecuencia', 'Activistas y radialistas de Bolivia.', '45 min',
          jsonb_build_object('tipo', 'archivo', 'nombreArchivo', ''));

  insert into public.programas (titulo, descripcion, icono)
  values ('La Señal', 'Radionovela: la frecuencia que nadie pudo silenciar.', '/images/episode-03.webp')
  returning id into v_id;

  insert into public.episodios (programa_id, nombre, descripcion, duracion, contenido)
  values (v_id, 'La Señal', 'Radionovela: la frecuencia que nadie pudo silenciar.', '45 min',
          jsonb_build_object('tipo', 'archivo', 'nombreArchivo', ''));
end $$;
