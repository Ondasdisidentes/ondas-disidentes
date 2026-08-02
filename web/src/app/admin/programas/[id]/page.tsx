"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useProgramas } from "../../programas-context";
import { CamposPrograma, cx } from "../../shared";
import type { Programa } from "@/lib/programas";

type Tab = "programa" | "episodios";

export default function EditarProgramaPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { obtenerPrograma, actualizarPrograma } = useProgramas();
  const programa = obtenerPrograma(id);

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

  const tabInicial: Tab = searchParams.get("tab") === "episodios" ? "episodios" : "programa";

  // key={programa.id}: si se navega a OTRO programa, React remonta este componente
  // y sus useState vuelven a inicializarse desde los datos del nuevo programa.
  return (
    <EditorPrograma
      key={programa.id}
      programa={programa}
      actualizarPrograma={actualizarPrograma}
      tabInicial={tabInicial}
    />
  );
}

function EditorPrograma({
  programa,
  actualizarPrograma,
  tabInicial,
}: {
  programa: Programa;
  actualizarPrograma: (id: string, cambios: Partial<Programa>) => void;
  tabInicial: Tab;
}) {
  const [tab, setTab] = useState<Tab>(tabInicial);
  const [titulo, setTitulo] = useState(programa.titulo);
  const [descripcion, setDescripcion] = useState(programa.descripcion);
  const [icono, setIcono] = useState<string | null>(programa.icono);
  const [avisoPrograma, setAvisoPrograma] = useState(false);

  function guardarPrograma() {
    if (!titulo.trim() || !icono) return;
    actualizarPrograma(programa.id, { titulo: titulo.trim(), descripcion, icono });
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
            />
            <div className="admin__wizard-nav">
              {avisoPrograma && <span className="admin__hint">✓ Guardado</span>}
              <div style={{ flex: 1 }} />
              <button type="button" onClick={guardarPrograma} disabled={!titulo.trim() || !icono} className="admin__btn">
                Guardar cambios
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
