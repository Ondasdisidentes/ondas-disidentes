"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { crearEpisodio } from "../../../../actions";
import { formAEpisodio, nuevoEpisodioForm, subirArchivoAudio } from "../../../../shared";

export function NuevoEpisodioForm({
  programaId,
  programaTitulo,
}: {
  programaId: string;
  programaTitulo: string;
}) {
  const groupName = useId();
  const [episodio, setEpisodio] = useState(nuevoEpisodioForm);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  async function handleArchivo(archivo: File | null) {
    setEpisodio((prev) => ({ ...prev, archivo, archivoUrl: "" }));
    setErrorSubida(null);
    if (!archivo) return;
    setSubiendo(true);
    const resultado = await subirArchivoAudio(archivo);
    setSubiendo(false);
    if ("error" in resultado) {
      setErrorSubida(resultado.error);
      return;
    }
    setEpisodio((prev) => ({ ...prev, archivoUrl: resultado.url }));
  }

  async function handleCrear() {
    if (!episodio.nombre.trim()) return;
    setError(null);
    setEnviando(true);
    const resultado = await crearEpisodio(programaId, formAEpisodio(episodio));
    // Si todo salió bien, crearEpisodio ya redirigió — esta línea no corre.
    if (resultado?.error) {
      setError(resultado.error);
      setEnviando(false);
    }
  }

  return (
    <div>
      <div className="admin__section-hd">
        <h2 className="admin__heading">Añadir episodio</h2>
        <Link href={`/admin/programas/${programaId}?tab=episodios`} className="admin__btn admin__btn--ghost">
          Cancelar
        </Link>
      </div>
      <p className="lbl" style={{ display: "block", marginBottom: "1rem" }}>
        Programa: {programaTitulo}
      </p>

      <div className="admin__form">
        <div className="admin__row">
          <label className="admin__field">
            <span>Nombre</span>
            <input
              value={episodio.nombre}
              onChange={(e) => setEpisodio({ ...episodio, nombre: e.target.value })}
              placeholder="Nombre del episodio"
            />
          </label>
          <label className="admin__field">
            <span>Duración</span>
            <input
              value={episodio.duracion}
              onChange={(e) => setEpisodio({ ...episodio, duracion: e.target.value })}
              placeholder="Ej. 45 min"
            />
          </label>
        </div>

        <label className="admin__field">
          <span>Descripción</span>
          <textarea
            value={episodio.descripcion}
            onChange={(e) => setEpisodio({ ...episodio, descripcion: e.target.value })}
            rows={3}
            placeholder="De qué trata este episodio"
          />
        </label>

        <div className="admin__block">
          <span className="lbl">Contenido</span>
          <div className="admin__toggle">
            <button
              type="button"
              onClick={() => setEpisodio({ ...episodio, tipoContenido: "archivo" })}
              aria-pressed={episodio.tipoContenido === "archivo"}
            >
              Archivo
            </button>
            <button
              type="button"
              onClick={() => setEpisodio({ ...episodio, tipoContenido: "soundcloud" })}
              aria-pressed={episodio.tipoContenido === "soundcloud"}
            >
              Link de SoundCloud
            </button>
          </div>

          {episodio.tipoContenido === "archivo" ? (
            <label className="admin__field" style={{ marginTop: ".5rem" }}>
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
                onChange={(e) => setEpisodio({ ...episodio, soundcloudUrl: e.target.value })}
                placeholder="https://soundcloud.com/..."
              />
            </label>
          )}
        </div>

        {error && <p className="admin__error">{error}</p>}

        <div className="admin__wizard-nav">
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={handleCrear}
            disabled={!episodio.nombre.trim() || enviando || subiendo}
            className="admin__btn"
          >
            {enviando ? "Creando…" : "Crear episodio"}
          </button>
        </div>
      </div>
    </div>
  );
}
