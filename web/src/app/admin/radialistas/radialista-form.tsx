"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ICONOS_DISPONIBLES } from "@/lib/programas";
import type { Panelista } from "@/lib/panelistas";
import { actualizarPanelista, crearPanelista, eliminarPanelista } from "../equipo-actions";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const PREFIJO_SUBIDA = `${SUPABASE_URL}/storage/v1/object/public/panelistas/`;

type Tipo = "subida" | "icono";

const TIPOS_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"];

function validarDimensiones(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      const ok = img.naturalWidth >= 300 && img.naturalHeight >= 300 && ratio >= 0.8 && ratio <= 1.25;
      URL.revokeObjectURL(url);
      resolve(ok);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    img.src = url;
  });
}

export function PanelistaForm({ panelista }: { panelista?: Panelista }) {
  const router = useRouter();
  const esEdicion = Boolean(panelista);
  const esSubidaActual = Boolean(panelista && panelista.fotoUrl.startsWith(PREFIJO_SUBIDA));

  const [nombre, setNombre] = useState(panelista?.nombre ?? "");
  const [puesto, setPuesto] = useState(panelista?.puesto ?? "");
  const [tipo, setTipo] = useState<Tipo>(!panelista || esSubidaActual ? "subida" : "icono");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(panelista?.fotoUrl ?? null);
  const [icono, setIcono] = useState<string | null>(panelista && !esSubidaActual ? panelista.fotoUrl : null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onArchivoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setError(null);
    if (!file) return;

    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      setError("La foto debe ser PNG, JPG o WEBP.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La foto no puede pesar más de 5MB.");
      e.target.value = "";
      return;
    }
    const dimensionesOk = await validarDimensiones(file);
    if (!dimensionesOk) {
      setError("La foto debe ser aproximadamente cuadrada y de al menos 300×300px, para que se vea bien en el grid.");
      e.target.value = "";
      return;
    }

    setArchivo(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleGuardar() {
    if (!nombre.trim()) return;
    if (tipo === "subida" && !archivo && !(esEdicion && esSubidaActual)) {
      setError("Subí una foto.");
      return;
    }
    if (tipo === "icono" && !icono) {
      setError("Elegí un ícono.");
      return;
    }

    setError(null);
    setEnviando(true);

    const formData = new FormData();
    formData.set("nombre", nombre.trim());
    formData.set("puesto", puesto.trim());
    formData.set("tipo", tipo);
    if (tipo === "subida" && archivo) formData.set("foto", archivo);
    if (tipo === "icono" && icono) formData.set("icono", icono);

    const resultado = panelista
      ? await actualizarPanelista(panelista.id, formData)
      : await crearPanelista(formData);

    // Si todo salió bien, crearPanelista redirige — esta línea no corre en ese caso.
    // actualizarPanelista no redirige (se queda en la página), así que acá sí
    // mostramos la confirmación.
    setEnviando(false);
    if (resultado?.error) {
      setError(resultado.error);
      return;
    }
    if (panelista) router.push("/admin/equipo");
  }

  async function handleEliminar() {
    if (!panelista) return;
    if (!window.confirm(`¿Eliminar a ${panelista.nombre} del equipo?`)) return;
    setEnviando(true);
    const resultado = await eliminarPanelista(panelista.id);
    if (resultado?.error) {
      setError(resultado.error);
      setEnviando(false);
    }
  }

  return (
    <div>
      <div className="admin__section-hd">
        <h2 className="admin__heading">{esEdicion ? panelista!.nombre : "Agregar integrante"}</h2>
        <Link href="/admin/equipo" className="admin__btn admin__btn--ghost">
          Cancelar
        </Link>
      </div>

      <div className="admin__form">
        <div className="admin__row">
          <label className="admin__field">
            <span>Nombre</span>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" />
          </label>
          <label className="admin__field">
            <span>Puesto</span>
            <input value={puesto} onChange={(e) => setPuesto(e.target.value)} placeholder="Ej. Producción" />
          </label>
        </div>

        <div className="admin__block">
          <span className="lbl" style={{ display: "block", marginBottom: ".4rem" }}>
            Foto
          </span>
          <div className="admin__toggle">
            <button type="button" onClick={() => setTipo("subida")} aria-pressed={tipo === "subida"}>
              Subir foto
            </button>
            <button type="button" onClick={() => setTipo("icono")} aria-pressed={tipo === "icono"}>
              Elegir ícono
            </button>
          </div>

          {tipo === "subida" ? (
            <label className="admin__field" style={{ marginTop: ".5rem" }}>
              {esEdicion && esSubidaActual && !archivo && (
                <span className="admin__hint">Ya tiene una foto subida — elegí un archivo para reemplazarla.</span>
              )}
              <input key="foto" type="file" accept="image/png,image/jpeg,image/webp" onChange={onArchivoChange} />
            </label>
          ) : (
            <div className="admin__icons" style={{ marginTop: ".5rem" }}>
              {ICONOS_DISPONIBLES.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setIcono(src)}
                  className="admin__icon"
                  aria-label={`Elegir ${src}`}
                  aria-pressed={icono === src}
                  style={{ backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center" }}
                />
              ))}
            </div>
          )}

          {previewUrl && (
            <div className="admin__thumb" style={{ marginTop: ".7rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
        </div>

        {error && <p className="admin__error">{error}</p>}

        <div className="admin__wizard-nav">
          {esEdicion && (
            <button type="button" onClick={handleEliminar} disabled={enviando} className="admin__ep-remove">
              Eliminar integrante
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button type="button" onClick={handleGuardar} disabled={enviando} className="admin__btn">
            {enviando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear integrante"}
          </button>
        </div>
      </div>
    </div>
  );
}
