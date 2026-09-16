// Tipos compartidos entre /admin/estilos (cliente) y la capa de datos
// server-only (src/lib/data/estilos.ts) — mismo criterio que galeria.ts.

// "auto": la galería se mueve sola, mucho más lento que la cinta.
// "manual": el visitante navega con flechas, con puntos de posición.
export type GaleriaModo = "auto" | "manual";

export type EstilosConfig = {
  tickerTexto: string;
  galeriaModo: GaleriaModo;
};
