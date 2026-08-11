"use client";

import { useState } from "react";
import type { StreamConfig } from "@/lib/data/stream-config";
import { actualizarConfigStream } from "../stream-actions";

export function StreamConfigForm({ config }: { config: StreamConfig }) {
  const [statusUrl, setStatusUrl] = useState(config.statusUrl);
  const [mount, setMount] = useState(config.mount);
  const [streamUrl, setStreamUrl] = useState(config.streamUrl);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleGuardar() {
    setError(null);
    setGuardado(false);
    setEnviando(true);

    const formData = new FormData();
    formData.set("statusUrl", statusUrl.trim());
    formData.set("mount", mount.trim());
    formData.set("streamUrl", streamUrl.trim());

    const resultado = await actualizarConfigStream(formData);
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
        <h2 className="admin__heading">Transmisión en vivo (giss.tv)</h2>
      </div>

      <div className="admin__form">
        <p className="admin__hint" style={{ display: "block", marginBottom: "1rem" }}>
          Datos públicos del stream de giss.tv: los usa el reproductor en vivo del sitio y el chequeo de
          estado. La contraseña de <em>source</em> (la que transmite el audio) no va acá — esa se carga
          aparte en BUTT u otro encoder, nunca en el sitio.
        </p>

        <label className="admin__field">
          <span>URL de estado (status-json.xsl)</span>
          <input
            type="url"
            value={statusUrl}
            onChange={(e) => setStatusUrl(e.target.value)}
            placeholder="https://giss.tv:667/status-json.xsl"
          />
        </label>

        <label className="admin__field">
          <span>Mount point</span>
          <input
            value={mount}
            onChange={(e) => setMount(e.target.value)}
            placeholder="/OndasDisidentes.mp3"
          />
        </label>

        <label className="admin__field">
          <span>URL pública del stream</span>
          <input
            type="url"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            placeholder="https://giss.tv:667/OndasDisidentes.mp3"
          />
        </label>

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
