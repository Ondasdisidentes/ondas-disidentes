// Tipos y constantes compartidos entre /admin/estilos (cliente) y la capa de
// datos server-only (src/lib/data/galeria.ts) — mismo criterio que
// programas.ts/radialistas.ts respecto de sus src/lib/data/*.ts.

export const MAX_IMAGENES_GALERIA = 20;

export type ImagenGaleria = {
  id: string;
  nombre: string;
  url: string;
  // null = la fila no es dueña de un archivo en el bucket 'galeria' (p. ej.
  // las fotos de prueba sembradas desde radialistas) — no se borra Storage
  // para esas filas, solo la fila.
  storagePath: string | null;
  creadoEn: string;
};

// Lógica del carrusel, compartida entre el carrusel real de la home
// (galeria-carrusel.tsx) y su vista previa en /admin/estilos
// (galeria-tab.tsx) — así el preview nunca queda desincronizado de lo que
// el visitante realmente ve.

// Cuántas veces se repite la lista de fotos por mitad del loop automático,
// para que cada mitad sea más ancha que la pantalla más ancha que vayamos a
// soportar — mismo problema que TICKER_REPS_POR_MITAD en home-client.tsx,
// pero acá escala con la cantidad de fotos en vez de ser un número fijo,
// porque el admin puede tener desde 1 hasta MAX_IMAGENES_GALERIA.
const GALERIA_SLOTS_MIN_POR_MITAD = 16;
// Segundos por foto en el loop automático — bastante más lento que la
// cinta (que hace ~2.85s por frase) para que se sienta "mucho más lento".
export const GALERIA_SEGUNDOS_POR_FOTO = 9;

export function calcularRepeticionesGaleria(cantidadImagenes: number): number {
  return Math.max(2, Math.ceil(GALERIA_SLOTS_MIN_POR_MITAD / Math.max(cantidadImagenes, 1)));
}

export function calcularDuracionGaleria(cantidadImagenes: number): number {
  return calcularRepeticionesGaleria(cantidadImagenes) * cantidadImagenes * GALERIA_SEGUNDOS_POR_FOTO;
}
