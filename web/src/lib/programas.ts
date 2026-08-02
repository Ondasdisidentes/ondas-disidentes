// Modelo de datos compartido entre la vista pública (dial de programas) y /admin.
// Por ahora es contenido de ejemplo en memoria — pendiente de conectar a Supabase.

export type ContenidoEpisodio =
  | { tipo: "archivo"; nombreArchivo: string }
  | { tipo: "soundcloud"; url: string };

export type Episodio = {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: string;
  contenido: ContenidoEpisodio;
};

export type Programa = {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  episodios: Episodio[];
};

// Ilustraciones disponibles para elegir como ícono de un programa (assets/ilustraciones).
export const ICONOS_DISPONIBLES: string[] = [
  "/images/episode-01.webp",
  "/images/episode-02.webp",
  "/images/episode-03.webp",
  ...Array.from({ length: 22 }, (_, i) => `/images/iconos/ilustracion-${String(i + 1).padStart(2, "0")}.png`),
  "/images/iconos/sticker-01.png",
  "/images/iconos/sticker-02.png",
];

export const PROGRAMAS_EJEMPLO: Programa[] = [
  {
    id: "cuerpo-politico",
    titulo: "Cuerpo Político",
    descripcion: "Derechos reproductivos desde el sur global.",
    icono: "/images/episode-01.webp",
    episodios: [
      {
        id: "cuerpo-politico-ep1",
        nombre: "Cuerpo Político",
        descripcion: "Derechos reproductivos desde el sur global.",
        duracion: "45 min",
        contenido: { tipo: "archivo", nombreArchivo: "" },
      },
    ],
  },
  {
    id: "territorio-frecuencia",
    titulo: "Territorio Frecuencia",
    descripcion: "Activistas y radialistas de Bolivia.",
    icono: "/images/episode-02.webp",
    episodios: [
      {
        id: "territorio-frecuencia-ep1",
        nombre: "Territorio Frecuencia",
        descripcion: "Activistas y radialistas de Bolivia.",
        duracion: "45 min",
        contenido: { tipo: "archivo", nombreArchivo: "" },
      },
    ],
  },
  {
    id: "la-senal",
    titulo: "La Señal",
    descripcion: "Radionovela: la frecuencia que nadie pudo silenciar.",
    icono: "/images/episode-03.webp",
    episodios: [
      {
        id: "la-senal-ep1",
        nombre: "La Señal",
        descripcion: "Radionovela: la frecuencia que nadie pudo silenciar.",
        duracion: "45 min",
        contenido: { tipo: "archivo", nombreArchivo: "" },
      },
    ],
  },
];
