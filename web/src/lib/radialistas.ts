// Modelo de datos de "El equipo" (Sobre nosotrxs). Los datos viven en
// Supabase (tabla `panelistas`, ver web/src/lib/data/panelistas.ts).

export type Panelista = {
  id: string;
  nombre: string;
  puesto: string;
  fotoUrl: string;
};
