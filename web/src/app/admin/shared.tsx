"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { ICONOS_DISPONIBLES, type ContenidoEpisodio, type Episodio } from "@/lib/programas";
import type { Radialista } from "@/lib/radialistas";
import { subirAudioEpisodio } from "./actions";
import { crearRadialista } from "./radialistas-actions";

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
  archivoUrl: string;
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
    archivoUrl: "",
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
    archivoUrl: e.contenido.tipo === "archivo" ? e.contenido.url : "",
    soundcloudUrl: e.contenido.tipo === "soundcloud" ? e.contenido.url : "",
  };
}

export async function subirArchivoAudio(archivo: File): Promise<{ url: string } | { error: string }> {
  const formData = new FormData();
  formData.set("archivo", archivo);
  return subirAudioEpisodio(formData);
}

export function formAEpisodio(e: EpisodioForm): Episodio {
  const contenido: ContenidoEpisodio =
    e.tipoContenido === "archivo"
      ? { tipo: "archivo", nombreArchivo: e.archivo?.name ?? e.archivoActual, url: e.archivoUrl }
      : { tipo: "soundcloud", url: e.soundcloudUrl };
  return {
    id: e.clave,
    nombre: e.nombre.trim() || "Episodio sin título",
    descripcion: e.descripcion,
    duracion: e.duracion || "—",
    contenido,
    creadoEn: new Date().toISOString(),
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
  radialistas: Radialista[];
  radialistaId: string | null;
  setRadialistaId: (v: string) => void;
}) {
  const { titulo, setTitulo, descripcion, setDescripcion, icono, setIcono, radialistas, radialistaId, setRadialistaId } =
    props;

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

      <RadialistaPicker radialistas={radialistas} radialistaId={radialistaId} setRadialistaId={setRadialistaId} />

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

const TIPOS_FOTO_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"];

function RadialistaPicker(props: {
  radialistas: Radialista[];
  radialistaId: string | null;
  setRadialistaId: (v: string) => void;
}) {
  const { radialistas, radialistaId, setRadialistaId } = props;
  const [lista, setLista] = useState(radialistas);
  const [modo, setModo] = useState<"elegir" | "crear">(radialistas.length === 0 ? "crear" : "elegir");
  const [nombre, setNombre] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [tipoFoto, setTipoFoto] = useState<"subida" | "icono">("subida");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [iconoFoto, setIconoFoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  async function handleCrear() {
    if (!nombre.trim()) {
      setError("Falta el nombre.");
      return;
    }
    if (tipoFoto === "subida" && !archivo) {
      setError("Subí una foto.");
      return;
    }
    if (tipoFoto === "icono" && !iconoFoto) {
      setError("Elegí un ícono.");
      return;
    }

    setError(null);
    setCreando(true);

    const formData = new FormData();
    formData.set("nombre", nombre.trim());
    formData.set("localidad", localidad.trim());
    formData.set("tipo", tipoFoto);
    if (tipoFoto === "subida" && archivo) formData.set("foto", archivo);
    if (tipoFoto === "icono" && iconoFoto) formData.set("icono", iconoFoto);

    const resultado = await crearRadialista(formData);
    setCreando(false);
    if ("error" in resultado) {
      setError(resultado.error);
      return;
    }

    setLista((prev) => [...prev, resultado.radialista]);
    setRadialistaId(resultado.radialista.id);
    setModo("elegir");
    setNombre("");
    setLocalidad("");
    setArchivo(null);
    setIconoFoto(null);
  }

  return (
    <div className="admin__block">
      <span className="lbl" style={{ display: "block", marginBottom: ".4rem" }}>
        Radialista asignado
      </span>

      {modo === "elegir" ? (
        <div style={{ display: "flex", gap: ".75rem", alignItems: "flex-start" }}>
          <label className="admin__field" style={{ flex: 1, marginBottom: 0 }}>
            <select value={radialistaId ?? ""} onChange={(e) => setRadialistaId(e.target.value)}>
              <option value="" disabled>
                Elegí un radialista
              </option>
              {lista.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                  {r.localidad ? ` — ${r.localidad}` : ""}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="admin__btn admin__btn--ghost" onClick={() => setModo("crear")}>
            + Nuevo radialista
          </button>
        </div>
      ) : (
        <div className="admin__ep">
          <div className="admin__ep-hd">
            <span>Nuevo radialista</span>
            {lista.length > 0 && (
              <button
                type="button"
                className="admin__ep-remove"
                onClick={() => {
                  setModo("elegir");
                  setError(null);
                }}
              >
                Cancelar
              </button>
            )}
          </div>

          <div className="admin__row">
            <label className="admin__field">
              <span>Nombre</span>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" />
            </label>
            <label className="admin__field">
              <span>Localidad</span>
              <input
                value={localidad}
                onChange={(e) => setLocalidad(e.target.value)}
                placeholder="Ej. Cochabamba"
              />
            </label>
          </div>

          <div>
            <span className="lbl">Foto</span>
            <div className="admin__toggle">
              <button type="button" onClick={() => setTipoFoto("subida")} aria-pressed={tipoFoto === "subida"}>
                Subir foto
              </button>
              <button type="button" onClick={() => setTipoFoto("icono")} aria-pressed={tipoFoto === "icono"}>
                Elegir ícono
              </button>
            </div>

            {tipoFoto === "subida" ? (
              <label className="admin__field" style={{ marginTop: ".5rem" }}>
                <input
                  key="foto"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    if (f && !TIPOS_FOTO_PERMITIDOS.includes(f.type)) {
                      setError("La foto debe ser PNG, JPG o WEBP.");
                      e.target.value = "";
                      return;
                    }
                    setError(null);
                    setArchivo(f);
                  }}
                />
              </label>
            ) : (
              <div className="admin__icons" style={{ marginTop: ".5rem" }}>
                {ICONOS_DISPONIBLES.map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setIconoFoto(src)}
                    className="admin__icon"
                    aria-label={`Elegir ${src}`}
                    aria-pressed={iconoFoto === src}
                    style={{ backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center" }}
                  />
                ))}
              </div>
            )}
          </div>

          {error && <p className="admin__error">{error}</p>}

          <div className="admin__wizard-nav">
            <div style={{ flex: 1 }} />
            <button type="button" onClick={handleCrear} disabled={creando} className="admin__btn admin__btn--ghost">
              {creando ? "Creando…" : "Crear radialista"}
            </button>
          </div>
        </div>
      )}
    </div>
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
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  async function handleArchivo(archivo: File | null) {
    onChange({ archivo, archivoUrl: "" });
    setErrorSubida(null);
    if (!archivo) return;
    setSubiendo(true);
    const resultado = await subirArchivoAudio(archivo);
    setSubiendo(false);
    if ("error" in resultado) {
      setErrorSubida(resultado.error);
      return;
    }
    onChange({ archivoUrl: resultado.url });
  }

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
              disabled={subiendo}
              onChange={(e) => handleArchivo(e.target.files?.[0] ?? null)}
            />
            {subiendo && <span className="admin__hint">Subiendo audio…</span>}
            {!subiendo && episodio.archivo && episodio.archivoUrl && (
              <span className="admin__hint">Audio subido: {episodio.archivo.name}</span>
            )}
            {errorSubida && <span className="admin__error">{errorSubida}</span>}
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
