// Modelo de datos de "Radialistas" (Sobre nosotrxs). Los datos viven en
// Supabase (tabla `radialistas`, ver web/src/lib/data/radialistas.ts).

export type Radialista = {
  id: string;
  nombre: string;
  localidad: string;
  fotoUrl: string;
};
