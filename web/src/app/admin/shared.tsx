"use client";

import { useId } from "react";
import Image from "next/image";
import { ICONOS_DISPONIBLES, type ContenidoEpisodio, type Episodio } from "@/lib/programas";

export function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type EpisodioForm = {
  clave: string;
  nombre: string;
  descripcion: string;
  duracion: string;
  tipoContenido: "archivo" | "soundcloud";
  archivo: File | null;
  archivoActual: string;
  soundcloudUrl: string;
};

export function nuevoEpisodioForm(): EpisodioForm {
  return {
    clave: crypto.randomUUID(),
    nombre: "",
    descripcion: "",
    duracion: "",
    tipoContenido: "archivo",
    archivo: null,
    archivoActual: "",
    soundcloudUrl: "",
  };
}

export function episodioAForm(e: Episodio): EpisodioForm {
  return {
    clave: e.id,
    nombre: e.nombre,
    descripcion: e.descripcion,
    duracion: e.duracion,
    tipoContenido: e.contenido.tipo,
    archivo: null,
    archivoActual: e.contenido.tipo === "archivo" ? e.contenido.nombreArchivo : "",
    soundcloudUrl: e.contenido.tipo === "soundcloud" ? e.contenido.url : "",
  };
}

export function formAEpisodio(e: EpisodioForm): Episodio {
  const contenido: ContenidoEpisodio =
    e.tipoContenido === "archivo"
      ? { tipo: "archivo", nombreArchivo: e.archivo?.name ?? e.archivoActual }
      : { tipo: "soundcloud", url: e.soundcloudUrl };
  return {
    id: e.clave,
    nombre: e.nombre.trim() || "Episodio sin título",
    descripcion: e.descripcion,
    duracion: e.duracion || "—",
    contenido,
  };
}

export function slugify(texto: string) {
  return (
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "programa"
  );
}

export function CamposPrograma(props: {
  titulo: string;
  setTitulo: (v: string) => void;
  descripcion: string;
  setDescripcion: (v: string) => void;
  icono: string | null;
  setIcono: (v: string) => void;
}) {
  const { titulo, setTitulo, descripcion, setDescripcion, icono, setIcono } = props;

  return (
    <>
      <div className="admin__row">
        <label className="admin__field">
          <span>Título</span>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej. Cuerpo Político" />
        </label>
        <label className="admin__field">
          <span>Descripción</span>
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Breve descripción del programa"
          />
        </label>
      </div>

      <div className="admin__block">
        <span className="lbl" style={{ display: "block", marginBottom: ".4rem" }}>
          Ícono — elige una ilustración de la marca
        </span>
        <div className="admin__icons">
          {ICONOS_DISPONIBLES.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setIcono(src)}
              className="admin__icon"
              aria-label={`Elegir ${src}`}
              aria-pressed={icono === src}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export function EditorEpisodios(props: {
  episodiosForm: EpisodioForm[];
  agregarEpisodioForm: () => void;
  quitarEpisodioForm: (clave: string) => void;
  actualizarEpisodioForm: (clave: string, cambios: Partial<EpisodioForm>) => void;
}) {
  const { episodiosForm, agregarEpisodioForm, quitarEpisodioForm, actualizarEpisodioForm } = props;

  return (
    <div className="admin__block">
      <div className="admin__block-hd">
        <span className="lbl">Episodios</span>
        <button type="button" onClick={agregarEpisodioForm} className="admin__btn admin__btn--ghost">
          + Agregar episodio
        </button>
      </div>

      {episodiosForm.map((ep, i) => (
        <EpisodioFormRow
          key={ep.clave}
          index={i}
          episodio={ep}
          onChange={(cambios) => actualizarEpisodioForm(ep.clave, cambios)}
          onQuitar={() => quitarEpisodioForm(ep.clave)}
          puedeQuitar={episodiosForm.length > 1}
        />
      ))}
    </div>
  );
}

function EpisodioFormRow(props: {
  index: number;
  episodio: EpisodioForm;
  onChange: (cambios: Partial<EpisodioForm>) => void;
  onQuitar: () => void;
  puedeQuitar: boolean;
}) {
  const { index, episodio, onChange, onQuitar, puedeQuitar } = props;
  const groupName = useId();

  return (
    <div className="admin__ep">
      <div className="admin__ep-hd">
        <span>Episodio {index + 1}</span>
        {puedeQuitar && (
          <button type="button" onClick={onQuitar} className="admin__ep-remove">
            Quitar
          </button>
        )}
      </div>

      <div className="admin__row">
        <label className="admin__field">
          <span>Nombre</span>
          <input
            value={episodio.nombre}
            onChange={(e) => onChange({ nombre: e.target.value })}
            placeholder="Nombre del episodio"
          />
        </label>
        <label className="admin__field">
          <span>Duración</span>
          <input
            value={episodio.duracion}
            onChange={(e) => onChange({ duracion: e.target.value })}
            placeholder="Ej. 45 min"
          />
        </label>
      </div>

      <label className="admin__field">
        <span>Descripción</span>
        <textarea
          value={episodio.descripcion}
          onChange={(e) => onChange({ descripcion: e.target.value })}
          rows={2}
          placeholder="De qué trata este episodio"
        />
      </label>

      <div>
        <span className="lbl">Contenido</span>
        <div className="admin__toggle">
          <button
            type="button"
            onClick={() => onChange({ tipoContenido: "archivo" })}
            aria-pressed={episodio.tipoContenido === "archivo"}
          >
            Archivo
          </button>
          <button
            type="button"
            onClick={() => onChange({ tipoContenido: "soundcloud" })}
            aria-pressed={episodio.tipoContenido === "soundcloud"}
          >
            Link de SoundCloud
          </button>
        </div>

        {episodio.tipoContenido === "archivo" ? (
          <label className="admin__field" style={{ marginTop: ".5rem" }}>
            {episodio.archivoActual && !episodio.archivo && (
              <span className="admin__hint">Archivo actual: {episodio.archivoActual}</span>
            )}
            <input
              key="archivo"
              type="file"
              accept="audio/*"
              name={groupName}
              onChange={(e) => onChange({ archivo: e.target.files?.[0] ?? null })}
            />
          </label>
        ) : (
          <label className="admin__field" style={{ marginTop: ".5rem" }}>
            <input
              key="soundcloud"
              value={episodio.soundcloudUrl}
              onChange={(e) => onChange({ soundcloudUrl: e.target.value })}
              placeholder="https://soundcloud.com/..."
            />
          </label>
        )}
      </div>
    </div>
  );
}
