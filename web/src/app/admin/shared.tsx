"use client";

import { useId, useState } from "react";
import { ICONO_PROGRAMA_DEFAULT, type ContenidoEpisodio, type Episodio } from "@/lib/programas";
import { RADIALISTA_FOTO_DEFAULT, type Radialista } from "@/lib/radialistas";
import { subirAudioEpisodio, subirImagenPrograma } from "./actions";
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

const TIPOS_IMG_PROGRAMA_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"];
const MAX_IMG_PROGRAMA_BYTES = 5 * 1024 * 1024;

type TipoImagenPrograma = "default" | "personalizado";

export function CamposPrograma(props: {
  titulo: string;
  setTitulo: (v: string) => void;
  descripcion: string;
  setDescripcion: (v: string) => void;
  icono: string | null;
  setIcono: (v: string | null) => void;
  radialistas: Radialista[];
  radialistaId: string | null;
  setRadialistaId: (v: string) => void;
}) {
  const { titulo, setTitulo, descripcion, setDescripcion, icono, setIcono, radialistas, radialistaId, setRadialistaId } =
    props;
  const [tipoImagen, setTipoImagen] = useState<TipoImagenPrograma>(
    icono && icono !== ICONO_PROGRAMA_DEFAULT ? "personalizado" : "default"
  );
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState<string | null>(null);

  function seleccionarDefault() {
    setTipoImagen("default");
    setErrorImagen(null);
    setIcono(null);
  }

  function seleccionarPersonalizado() {
    setTipoImagen("personalizado");
    setErrorImagen(null);
  }

  async function handleImagen(archivo: File | null) {
    setErrorImagen(null);
    if (!archivo) return;
    if (!TIPOS_IMG_PROGRAMA_PERMITIDOS.includes(archivo.type)) {
      setErrorImagen("La imagen debe ser PNG, JPG o WEBP.");
      return;
    }
    if (archivo.size > MAX_IMG_PROGRAMA_BYTES) {
      setErrorImagen("La imagen no puede pesar más de 5MB.");
      return;
    }
    setSubiendoImagen(true);
    const formData = new FormData();
    formData.set("archivo", archivo);
    const resultado = await subirImagenPrograma(formData);
    setSubiendoImagen(false);
    if ("error" in resultado) {
      setErrorImagen(resultado.error);
      return;
    }
    setIcono(resultado.url);
  }

  return (
    <>
      <label className="admin__field">
        <span>Título</span>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej. Cuerpo Político" />
      </label>

      <label className="admin__field">
        <span>Descripción</span>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={5}
          placeholder="Descripción del programa"
        />
      </label>

      <RadialistaPicker radialistas={radialistas} radialistaId={radialistaId} setRadialistaId={setRadialistaId} />

      <div className="admin__block">
        <span className="lbl" style={{ display: "block", marginBottom: ".4rem" }}>
          Imagen de portada
        </span>
        <div className="admin__toggle">
          <button type="button" onClick={seleccionarDefault} aria-pressed={tipoImagen === "default"}>
            Por defecto
          </button>
          <button type="button" onClick={seleccionarPersonalizado} aria-pressed={tipoImagen === "personalizado"}>
            Personalizado
          </button>
        </div>

        {tipoImagen === "default" ? (
          <div className="admin__thumb admin__thumb--lg" style={{ marginTop: ".6rem" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ICONO_PROGRAMA_DEFAULT}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : (
          <div className="admin__imgpicker" style={{ marginTop: ".6rem" }}>
            {icono && (
              <div className="admin__thumb admin__thumb--lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={icono} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <div>
              <label className="admin__field" style={{ marginBottom: 0 }}>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={subiendoImagen}
                  onChange={(e) => handleImagen(e.target.files?.[0] ?? null)}
                />
              </label>
              <p className="admin__hint" style={{ display: "block", marginTop: ".4rem" }}>
                {subiendoImagen ? "Subiendo imagen…" : icono ? "Imagen propia cargada." : "Elegí un archivo para subir."}
              </p>
              {errorImagen && <p className="admin__error">{errorImagen}</p>}
            </div>
          </div>
        )}
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
  const [tipoFoto, setTipoFoto] = useState<"default" | "personalizado">("default");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  async function handleCrear() {
    if (!nombre.trim()) {
      setError("Falta el nombre.");
      return;
    }

    setError(null);
    setCreando(true);

    const formData = new FormData();
    formData.set("nombre", nombre.trim());
    formData.set("localidad", localidad.trim());
    formData.set("tipo", tipoFoto);
    if (tipoFoto === "personalizado" && archivo) formData.set("foto", archivo);

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
    setPreviewUrl(null);
    setTipoFoto("default");
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
              <button
                type="button"
                onClick={() => {
                  setTipoFoto("default");
                  setError(null);
                  setArchivo(null);
                  setPreviewUrl(null);
                }}
                aria-pressed={tipoFoto === "default"}
              >
                Por defecto
              </button>
              <button type="button" onClick={() => setTipoFoto("personalizado")} aria-pressed={tipoFoto === "personalizado"}>
                Personalizado
              </button>
            </div>

            {tipoFoto === "default" ? (
              <div className="admin__thumb admin__thumb--lg" style={{ marginTop: ".6rem" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={RADIALISTA_FOTO_DEFAULT}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ) : (
              <>
                <label className="admin__field" style={{ marginTop: ".6rem" }}>
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
                      setPreviewUrl(f ? URL.createObjectURL(f) : null);
                    }}
                  />
                </label>
                {previewUrl && (
                  <div className="admin__thumb admin__thumb--lg" style={{ marginTop: ".6rem" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
              </>
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
