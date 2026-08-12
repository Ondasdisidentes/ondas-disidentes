"use client";

import { useState } from "react";
import Link from "next/link";
import type { StreamConfig } from "@/lib/data/stream-config";
import { actualizarConfigStream } from "../stream-actions";

function IconCopy() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CampoIcecast({ label, value }: { label: string; value: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(value);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // Clipboard API puede fallar sin permisos — no rompemos la UI por eso,
      // el campo sigue siendo seleccionable/copiable a mano.
    }
  }

  return (
    <label className="admin__field">
      <span>{label}</span>
      <div className="admin__copyfield">
        <input value={value} readOnly onFocus={(e) => e.target.select()} />
        <button
          type="button"
          className={`admin__copybtn${copiado ? " is-copied" : ""}`}
          onClick={copiar}
          aria-label={copiado ? `${label} copiado` : `Copiar ${label}`}
        >
          {copiado ? <IconCheck /> : <IconCopy />}
        </button>
      </div>
    </label>
  );
}

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
        <div className="admin__section-hd-left">
          <Link href="/admin" className="admin__btn admin__btn--ghost">
            ← Atrás
          </Link>
          <h2 className="admin__heading">Transmisión en vivo (giss.tv)</h2>
        </div>
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

      <div className="admin__form" style={{ marginTop: "1.5rem" }}>
        <h3 className="admin__heading" style={{ fontSize: "1.3rem", margin: "0 0 .6rem" }}>
          Servidor Icecast (dato de Giss)
        </h3>
        <p className="admin__hint" style={{ display: "block", marginBottom: "1rem" }}>
          Para configurar el encoder (ej. Mixxx) al transmitir — no se usa en el sitio ni se guarda en la
          base de datos, es solo referencia fija de lo que dio Giss. Los campos son de solo lectura, hacé
          clic y copiá.
        </p>

        <div className="admin__row">
          <CampoIcecast label="Server" value="giss.tv" />
          <CampoIcecast label="Port" value="8001" />
        </div>

        <div className="admin__row">
          <CampoIcecast label="Mountpoint" value="ondasdisidentes.mp3" />
          <CampoIcecast label="User" value="source" />
        </div>

        <CampoIcecast label="Password" value="1bcwr" />
        <CampoIcecast label="URL (http)" value="http://giss.tv:8001/ondasdisidentes.mp3" />
        <CampoIcecast label="URL (https)" value="https://giss.tv:667/ondasdisidentes.mp3" />
      </div>
    </div>
  );
}
