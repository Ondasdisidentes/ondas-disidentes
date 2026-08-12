// Modelo de datos compartido entre la vista pública (dial de programas) y
// /admin. Los datos viven en Supabase (tablas `programas`/`episodios`,
// ver web/src/lib/data/programas.ts).

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

// Imagen de portada cuando el programa no tiene una subida propia.
export const ICONO_PROGRAMA_DEFAULT = "/images/portada-default.webp";
