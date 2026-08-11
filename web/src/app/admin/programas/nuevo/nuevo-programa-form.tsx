"use client";

import { useState } from "react";
import Link from "next/link";
import { crearPrograma } from "../../actions";
import {
  CamposPrograma,
  EditorEpisodios,
  cx,
  formAEpisodio,
  nuevoEpisodioForm,
  type EpisodioForm,
} from "../../shared";

type Paso = 1 | 2;

export function NuevoProgramaForm() {
  const [paso, setPaso] = useState<Paso>(1);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [icono, setIcono] = useState<string | null>("/images/portada-default.webp");
  const [episodiosForm, setEpisodiosForm] = useState<EpisodioForm[]>([nuevoEpisodioForm()]);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function agregarEpisodioForm() {
    setEpisodiosForm((prev) => [...prev, nuevoEpisodioForm()]);
  }
  function quitarEpisodioForm(clave: string) {
    setEpisodiosForm((prev) => (prev.length > 1 ? prev.filter((e) => e.clave !== clave) : prev));
  }
  function actualizarEpisodioForm(clave: string, cambios: Partial<EpisodioForm>) {
    setEpisodiosForm((prev) => prev.map((e) => (e.clave === clave ? { ...e, ...cambios } : e)));
  }

  async function handleCrear() {
    if (!titulo.trim() || !icono) return;
    setError(null);
    setEnviando(true);
    const resultado = await crearPrograma({
      titulo: titulo.trim(),
      descripcion,
      icono,
      episodios: episodiosForm.map(formAEpisodio),
    });
    // Si todo salió bien, crearPrograma ya redirigió — esta línea no corre.
    if (resultado?.error) {
      setError(resultado.error);
      setEnviando(false);
    }
  }

  const paso1Valido = Boolean(titulo.trim() && icono);

  return (
    <div>
      <div className="admin__section-hd">
        <h2 className="admin__heading">Agregar programa</h2>
        <Link href="/admin" className="admin__btn admin__btn--ghost">
          Cancelar
        </Link>
      </div>

      <div className="admin__steps">
        <button
          type="button"
          className={cx("admin__step", paso === 1 && "is-active")}
          onClick={() => setPaso(1)}
        >
          <span>1</span>Datos del programa
        </button>
        <button
          type="button"
          className={cx("admin__step", paso === 2 && "is-active")}
          onClick={() => paso1Valido && setPaso(2)}
          disabled={!paso1Valido}
        >
          <span>2</span>Episodios
        </button>
      </div>

      <div className="admin__form">
        {paso === 1 ? (
          <CamposPrograma
            titulo={titulo}
            setTitulo={setTitulo}
            descripcion={descripcion}
            setDescripcion={setDescripcion}
            icono={icono}
            setIcono={setIcono}
          />
        ) : (
          <EditorEpisodios
            episodiosForm={episodiosForm}
            agregarEpisodioForm={agregarEpisodioForm}
            quitarEpisodioForm={quitarEpisodioForm}
            actualizarEpisodioForm={actualizarEpisodioForm}
          />
        )}

        {error && <p className="admin__error">{error}</p>}

        <div className="admin__wizard-nav">
          {paso === 2 && (
            <button type="button" onClick={() => setPaso(1)} className="admin__btn admin__btn--ghost">
              ← Atrás
            </button>
          )}
          <div style={{ flex: 1 }} />
          {paso === 1 ? (
            <button type="button" onClick={() => setPaso(2)} disabled={!paso1Valido} className="admin__btn">
              Siguiente →
            </button>
          ) : (
            <button type="button" onClick={handleCrear} disabled={enviando} className="admin__btn">
              {enviando ? "Creando…" : "Crear programa"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
