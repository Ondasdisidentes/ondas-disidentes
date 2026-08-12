"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { actualizarPrograma, eliminarEpisodio, eliminarPrograma } from "../../actions";
import { CamposPrograma, cx } from "../../shared";
import { ConfirmDialog } from "../../confirm-dialog";
import type { Programa } from "@/lib/programas";
import type { Radialista } from "@/lib/radialistas";

type Tab = "programa" | "episodios";

export function EditorPrograma({
  programa,
  radialistas,
  tabInicial,
}: {
  programa: Programa;
  radialistas: Radialista[];
  tabInicial: Tab;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(tabInicial);
  const [titulo, setTitulo] = useState(programa.titulo);
  const [descripcion, setDescripcion] = useState(programa.descripcion);
  const [icono, setIcono] = useState<string | null>(programa.icono);
  const [radialistaId, setRadialistaId] = useState<string | null>(programa.radialistaId);
  const [avisoPrograma, setAvisoPrograma] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoPrograma, setEliminandoPrograma] = useState(false);
  const [confirmarEliminarPrograma, setConfirmarEliminarPrograma] = useState(false);
  const [eliminandoEpisodioId, setEliminandoEpisodioId] = useState<string | null>(null);
  const [episodioAEliminar, setEpisodioAEliminar] = useState<{ id: string; nombre: string } | null>(null);
  const [errorEpisodios, setErrorEpisodios] = useState<string | null>(null);

  async function guardarPrograma() {
    if (!titulo.trim() || !icono || !radialistaId) return;
    setError(null);
    setGuardando(true);
    const resultado = await actualizarPrograma(programa.id, {
      titulo: titulo.trim(),
      descripcion,
      icono,
      radialistaId,
    });
    setGuardando(false);
    if (resultado?.error) {
      setError(resultado.error);
      return;
    }
    setAvisoPrograma(true);
    setTimeout(() => setAvisoPrograma(false), 2000);
  }

  async function confirmarEliminarProgramaAhora() {
    setError(null);
    setEliminandoPrograma(true);
    const resultado = await eliminarPrograma(programa.id);
    // Si todo salió bien, eliminarPrograma ya redirigió — esta línea no corre.
    if (resultado?.error) {
      setError(resultado.error);
      setEliminandoPrograma(false);
      setConfirmarEliminarPrograma(false);
    }
  }

  async function confirmarEliminarEpisodioAhora() {
    if (!episodioAEliminar) return;
    setErrorEpisodios(null);
    setEliminandoEpisodioId(episodioAEliminar.id);
    const resultado = await eliminarEpisodio(episodioAEliminar.id, programa.id);
    setEliminandoEpisodioId(null);
    setEpisodioAEliminar(null);
    if (resultado?.error) {
      setErrorEpisodios(resultado.error);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="admin__section-hd">
        <div className="admin__section-hd-left">
          <Link href="/admin/programas" className="admin__btn admin__btn--ghost">
            ← Atrás
          </Link>
          <h2 className="admin__heading">{programa.titulo}</h2>
        </div>
      </div>

      <div className="admin__tabs">
        <button type="button" className={cx("admin__tab", tab === "programa" && "is-active")} onClick={() => setTab("programa")}>
          Editar programa
        </button>
        <button type="button" className={cx("admin__tab", tab === "episodios" && "is-active")} onClick={() => setTab("episodios")}>
          Episodios ({programa.episodios.length})
        </button>
      </div>

      <div className="admin__form">
        {tab === "programa" ? (
          <>
            <CamposPrograma
              titulo={titulo}
              setTitulo={setTitulo}
              descripcion={descripcion}
              setDescripcion={setDescripcion}
              icono={icono}
              setIcono={setIcono}
              radialistas={radialistas}
              radialistaId={radialistaId}
              setRadialistaId={setRadialistaId}
            />
            {error && <p className="admin__error">{error}</p>}
            <div className="admin__wizard-nav">
              <button
                type="button"
                onClick={() => setConfirmarEliminarPrograma(true)}
                disabled={eliminandoPrograma}
                className="admin__ep-remove"
              >
                {eliminandoPrograma ? "Eliminando…" : "Eliminar programa"}
              </button>
              {avisoPrograma && <span className="admin__hint">✓ Guardado</span>}
              <div style={{ flex: 1 }} />
              <button
                type="button"
                onClick={guardarPrograma}
                disabled={!titulo.trim() || !icono || !radialistaId || guardando}
                className="admin__btn"
              >
                {guardando ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="admin__block-hd">
              <span className="lbl">Episodios</span>
              <Link href={`/admin/programas/${programa.id}/episodios/nuevo`} className="admin__btn admin__btn--ghost">
                + Añadir episodio
              </Link>
            </div>

            {errorEpisodios && <p className="admin__error">{errorEpisodios}</p>}

            {programa.episodios.length === 0 ? (
              <p className="admin__ep-list-empty">Este programa todavía no tiene episodios.</p>
            ) : (
              programa.episodios.map((e) => (
                <div key={e.id} className="admin__ep-list-row">
                  <div>
                    <h4 className="admin__heading">{e.nombre}</h4>
                    <p>{e.descripcion || e.duracion}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: ".8rem", flex: "none" }}>
                    <span className="admin__ep-list-tag">
                      {e.contenido.tipo === "archivo" ? "Archivo" : "SoundCloud"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEpisodioAEliminar({ id: e.id, nombre: e.nombre })}
                      disabled={eliminandoEpisodioId === e.id}
                      className="admin__ep-remove"
                    >
                      {eliminandoEpisodioId === e.id ? "Eliminando…" : "Eliminar"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmarEliminarPrograma}
        title="Eliminar programa"
        message={`¿Eliminar el programa "${programa.titulo}"? Se van a borrar también sus ${programa.episodios.length} episodio${programa.episodios.length === 1 ? "" : "s"}. Esta acción no se puede deshacer.`}
        pending={eliminandoPrograma}
        onCancel={() => setConfirmarEliminarPrograma(false)}
        onConfirm={confirmarEliminarProgramaAhora}
      />

      <ConfirmDialog
        open={!!episodioAEliminar}
        title="Eliminar episodio"
        message={`¿Eliminar el episodio "${episodioAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        pending={!!episodioAEliminar && eliminandoEpisodioId === episodioAEliminar.id}
        onCancel={() => setEpisodioAEliminar(null)}
        onConfirm={confirmarEliminarEpisodioAhora}
      />
    </div>
  );
}
