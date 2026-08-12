-- La foto placeholder de los radialistas sin foto propia todavía pasa de
-- portada-default.webp (pensada para programas) a un retrato anónimo
-- específico para personas — ver 0009_radialistas_seed.sql.
update public.radialistas
set foto_url = '/images/radialista-foto-default.webp'
where foto_url = '/images/portada-default.webp';
