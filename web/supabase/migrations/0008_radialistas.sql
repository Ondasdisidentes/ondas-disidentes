-- =========================================================
-- Ondas Disidentes — "Equipo" pasa a llamarse "Radialistas", y cada
-- programa pasa a tener un radialista asignado de forma obligatoria.
-- =========================================================

-- ---------- panelistas -> radialistas ----------
-- Renombra la tabla y su columna 'puesto' -> 'localidad'. Conserva ids y
-- filas existentes. El bucket de Storage sigue llamándose 'panelistas'
-- (detalle interno, invisible para el usuario) para no tener que crear un
-- bucket nuevo y migrar los archivos ya subidos.
alter table public.panelistas rename to radialistas;
alter table public.radialistas rename column puesto to localidad;

drop policy if exists "panelistas_select_public" on public.radialistas;
drop policy if exists "panelistas_insert_admin" on public.radialistas;
drop policy if exists "panelistas_update_admin" on public.radialistas;
drop policy if exists "panelistas_delete_admin" on public.radialistas;

create policy "radialistas_select_public"
  on public.radialistas
  for select
  to anon, authenticated
  using (true);

create policy "radialistas_insert_admin"
  on public.radialistas
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

create policy "radialistas_update_admin"
  on public.radialistas
  for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com')
  with check ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

create policy "radialistas_delete_admin"
  on public.radialistas
  for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ondasdisidentes@outlook.com');

-- ---------- programas.radialista_id (obligatorio) ----------
-- Se agrega nullable, se rellenan las filas existentes con un radialista
-- placeholder (si hace falta) y recién ahí se pone NOT NULL — así la
-- migración no rompe programas ya creados (ver 0002_seed_ejemplo.sql).
alter table public.programas
  add column radialista_id uuid references public.radialistas(id);

do $$
declare
  v_placeholder_id uuid;
begin
  if exists (select 1 from public.programas where radialista_id is null) then
    insert into public.radialistas (nombre, localidad, foto_url)
    values ('Radialista por asignar', '', '/images/iconos/ilustracion-01.png')
    returning id into v_placeholder_id;

    update public.programas set radialista_id = v_placeholder_id where radialista_id is null;
  end if;
end $$;

alter table public.programas alter column radialista_id set not null;
