// Modelo de datos de "Radialistas" (Sobre nosotrxs). Los datos viven en
// Supabase (tabla `radialistas`, ver web/src/lib/data/radialistas.ts).

// Foto cuando el radialista no tiene una subida propia — ver
// supabase/migrations/0012_radialistas_foto_default.sql.
export const RADIALISTA_FOTO_DEFAULT = "/images/radialista-foto-default.webp";

export type Radialista = {
  id: string;
  nombre: string;
  localidad: string;
  fotoUrl: string;
};
