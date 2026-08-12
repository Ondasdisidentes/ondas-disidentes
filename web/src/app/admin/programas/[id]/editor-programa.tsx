"use client";

import { useState } from "react";
import Link from "next/link";
import { actualizarPrograma } from "../../actions";
import { CamposPrograma, cx } from "../../shared";
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
  const [tab, setTab] = useState<Tab>(tabInicial);
  const [titulo, setTitulo] = useState(programa.titulo);
  const [descripcion, setDescripcion] = useState(programa.descripcion);
  const [icono, setIcono] = useState<string | null>(programa.icono);
  const [radialistaId, setRadialistaId] = useState<string | null>(programa.radialistaId);
  const [avisoPrograma, setAvisoPrograma] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

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

  return (
    <div>
      <div className="admin__section-hd">
        <h2 className="admin__heading">{programa.titulo}</h2>
        <Link href="/admin" className="admin__btn admin__btn--ghost">
          ← Volver
        </Link>
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

            {programa.episodios.length === 0 ? (
              <p className="admin__ep-list-empty">Este programa todavía no tiene episodios.</p>
            ) : (
              programa.episodios.map((e) => (
                <div key={e.id} className="admin__ep-list-row">
                  <div>
                    <h4 className="admin__heading">{e.nombre}</h4>
                    <p>{e.descripcion || e.duracion}</p>
                  </div>
                  <span className="admin__ep-list-tag">{e.contenido.tipo === "archivo" ? "Archivo" : "SoundCloud"}</span>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
