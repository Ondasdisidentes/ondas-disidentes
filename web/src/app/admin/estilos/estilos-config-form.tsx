"use client";

import { useState } from "react";
import Link from "next/link";
import type { EstilosConfig } from "@/lib/data/estilos";
import { actualizarConfigEstilos } from "../estilos-actions";

// Mismo fallback que home-client.tsx: si el admin borra todo, la cinta real
// no queda en blanco, así que la vista previa tiene que reflejar eso también.
const TICKER_FALLBACK = ["Al aire por internet", "En castellano y en quechua."];
const PREVIEW_REPS_POR_MITAD = 4;

export function EstilosConfigForm({ config }: { config: EstilosConfig }) {
  const [tickerTexto, setTickerTexto] = useState(config.tickerTexto);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const frases = tickerTexto
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);
  const frasesPreview = frases.length > 0 ? frases : TICKER_FALLBACK;
  const previewMitad = Array.from({ length: PREVIEW_REPS_POR_MITAD }, () => frasesPreview).flat();
  const previewItems = [...previewMitad, ...previewMitad].flatMap((frase, i) => [
    <span key={`t${i}`}>{frase}</span>,
    <i key={`b${i}`}>●</i>,
  ]);

  async function handleGuardar() {
    setError(null);
    setGuardado(false);
    setEnviando(true);

    const formData = new FormData();
    formData.set("tickerTexto", tickerTexto.trim());

    const resultado = await actualizarConfigEstilos(formData);
    setEnviando(false);
    if (resultado?.error) {
      setError(resultado.error);
      return;
    }
    setGuardado(true);
  }

  return (
    <div>
      <div className="admin__section-hd">
        <div className="admin__section-hd-left">
          <Link href="/admin" className="admin__btn admin__btn--ghost">
            ← Atrás
          </Link>
          <h2 className="admin__heading">Estilos</h2>
        </div>
      </div>

      <div className="admin__form">
        <p className="admin__hint" style={{ display: "block", marginBottom: "1rem" }}>
          Frases de la cinta que se mueve debajo del hero, en la home. Una frase por línea — se repiten
          en bucle, separadas por un punto (●). Evitá dejarlas muy cortas: si son pocos caracteres en
          total, la cinta puede dejar un hueco en blanco en pantallas muy anchas antes de volver a
          empezar la vuelta.
        </p>

        <label className="admin__field">
          <span>Frases de la cinta</span>
          <textarea
            value={tickerTexto}
            onChange={(e) => setTickerTexto(e.target.value)}
            rows={4}
            placeholder={"Al aire por internet\nEn castellano y en quechua."}
          />
        </label>

        <div className="admin__field">
          <span>Vista previa</span>
          <div className="admin__ticker-preview">
            <div className="admin__ticker-preview-track">{previewItems}</div>
          </div>
        </div>

        {error && <p className="admin__error">{error}</p>}
        {guardado && !error && <p className="admin__hint">Guardado.</p>}

        <div className="admin__wizard-nav">
          <div style={{ flex: 1 }} />
          <button type="button" onClick={handleGuardar} disabled={enviando} className="admin__btn">
            {enviando ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
