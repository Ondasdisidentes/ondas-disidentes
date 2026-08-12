// Modelo de datos compartido entre la vista pública (dial de programas) y
// /admin. Los datos viven en Supabase (tablas `programas`/`episodios`,
// ver web/src/lib/data/programas.ts) — este archivo solo define los tipos
// y la lista estática de íconos disponibles.

export type ContenidoEpisodio =
  | { tipo: "archivo"; nombreArchivo: string; url: string }
  | { tipo: "soundcloud"; url: string };

export type Episodio = {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: string;
  contenido: ContenidoEpisodio;
  creadoEn: string;
};

export type Programa = {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  radialistaId: string;
  radialistaNombre: string;
  episodios: Episodio[];
};

// Ilustraciones disponibles para elegir como ícono de un programa (assets/ilustraciones).
export const ICONOS_DISPONIBLES: string[] = [
  "/images/portada-default.webp",
  "/images/episode-01.webp",
  "/images/episode-02.webp",
  "/images/episode-03.webp",
  ...Array.from({ length: 22 }, (_, i) => `/images/iconos/ilustracion-${String(i + 1).padStart(2, "0")}.png`),
  "/images/iconos/sticker-01.png",
  "/images/iconos/sticker-02.png",
];
