"use client";

import { useId, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useProgramas } from "../../../../programas-context";
import { formAEpisodio, nuevoEpisodioForm } from "../../../../shared";

export default function NuevoEpisodioPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { obtenerPrograma, actualizarPrograma } = useProgramas();
  const programa = obtenerPrograma(id);
  const groupName = useId();

  const [episodio, setEpisodio] = useState(nuevoEpisodioForm);

  if (!programa) {
    return (
      <div>
        <p>No se encontró este programa.</p>
        <Link href="/admin" className="admin__btn admin__btn--ghost">
          ← Volver a programas
        </Link>
      </div>
    );
  }

  function crearEpisodio() {
    if (!programa || !episodio.nombre.trim()) return;
    const nuevo = formAEpisodio(episodio);
    actualizarPrograma(programa.id, { episodios: [...programa.episodios, nuevo] });
    router.push(`/admin/programas/${programa.id}?tab=episodios`);
  }

  return (
    <div>
      <div className="admin__section-hd">
        <h2 className="admin__heading">Añadir episodio</h2>
        <Link href={`/admin/programas/${programa.id}?tab=episodios`} className="admin__btn admin__btn--ghost">
          Cancelar
        </Link>
      </div>
      <p className="lbl" style={{ display: "block", marginBottom: "1rem" }}>
        Programa: {programa.titulo}
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
                onChange={(e) => setEpisodio({ ...episodio, archivo: e.target.files?.[0] ?? null })}
              />
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

        <div className="admin__wizard-nav">
          <div style={{ flex: 1 }} />
          <button type="button" onClick={crearEpisodio} disabled={!episodio.nombre.trim()} className="admin__btn">
            Crear episodio
          </button>
        </div>
      </div>
    </div>
  );
}
