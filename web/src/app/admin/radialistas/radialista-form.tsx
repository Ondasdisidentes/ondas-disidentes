"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RADIALISTA_FOTO_DEFAULT, type Radialista } from "@/lib/radialistas";
import { actualizarRadialista, crearRadialista, eliminarRadialista } from "../radialistas-actions";
import { ConfirmDialog } from "../confirm-dialog";

type Tipo = "default" | "personalizado";

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

export function RadialistaForm({ radialista }: { radialista?: Radialista }) {
  const router = useRouter();
  const esEdicion = Boolean(radialista);
  const tieneFotoPropia = Boolean(radialista && radialista.fotoUrl !== RADIALISTA_FOTO_DEFAULT);

  const [nombre, setNombre] = useState(radialista?.nombre ?? "");
  const [localidad, setLocalidad] = useState(radialista?.localidad ?? "");
  const [tipo, setTipo] = useState<Tipo>(tieneFotoPropia ? "personalizado" : "default");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    tieneFotoPropia ? radialista!.fotoUrl : null
  );
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  function seleccionarDefault() {
    setTipo("default");
    setError(null);
    setArchivo(null);
    setPreviewUrl(null);
  }

  function seleccionarPersonalizado() {
    setTipo("personalizado");
    setError(null);
    if (!archivo) setPreviewUrl(tieneFotoPropia ? radialista!.fotoUrl : null);
  }

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

    setError(null);
    setEnviando(true);

    const formData = new FormData();
    formData.set("nombre", nombre.trim());
    formData.set("localidad", localidad.trim());
    formData.set("tipo", tipo);
    if (tipo === "personalizado" && archivo) formData.set("foto", archivo);

    const resultado = radialista
      ? await actualizarRadialista(radialista.id, formData)
      : await crearRadialista(formData);

    setEnviando(false);
    if (resultado && "error" in resultado) {
      setError(resultado.error);
      return;
    }
    router.push("/admin/radialistas");
  }

  async function handleEliminar() {
    if (!radialista) return;
    setEnviando(true);
    const resultado = await eliminarRadialista(radialista.id);
    if (resultado?.error) {
      setError(resultado.error);
      setEnviando(false);
      setConfirmarEliminar(false);
    }
  }

  return (
    <div>
      <div className="admin__section-hd">
        <div className="admin__section-hd-left">
          <Link href="/admin/radialistas" className="admin__btn admin__btn--ghost">
            ← Atrás
          </Link>
          <h2 className="admin__heading">{esEdicion ? radialista!.nombre : "Agregar radialista"}</h2>
        </div>
      </div>

      <div className="admin__form">
        <div className="admin__row">
          <label className="admin__field">
            <span>Nombre</span>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" />
          </label>
          <label className="admin__field">
            <span>Localidad</span>
            <input
              value={localidad}
              onChange={(e) => setLocalidad(e.target.value)}
              placeholder="Ej. Cochabamba"
            />
          </label>
        </div>

        <div className="admin__block">
          <span className="lbl" style={{ display: "block", marginBottom: ".4rem" }}>
            Foto
          </span>
          <div className="admin__toggle">
            <button type="button" onClick={seleccionarDefault} aria-pressed={tipo === "default"}>
              Por defecto
            </button>
            <button type="button" onClick={seleccionarPersonalizado} aria-pressed={tipo === "personalizado"}>
              Personalizado
            </button>
          </div>

          {tipo === "default" ? (
            <div className="admin__thumb admin__thumb--lg" style={{ marginTop: ".6rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={RADIALISTA_FOTO_DEFAULT}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ) : (
            <>
              <label className="admin__field" style={{ marginTop: ".6rem" }}>
                {esEdicion && tieneFotoPropia && !archivo && (
                  <span className="admin__hint">Ya tenés una foto — elegí un archivo para reemplazarla.</span>
                )}
                <input key="foto" type="file" accept="image/png,image/jpeg,image/webp" onChange={onArchivoChange} />
              </label>
              {previewUrl && (
                <div className="admin__thumb admin__thumb--lg" style={{ marginTop: ".6rem" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
            </>
          )}
        </div>

        {error && <p className="admin__error">{error}</p>}

        <div className="admin__wizard-nav">
          {esEdicion && (
            <button
              type="button"
              onClick={() => setConfirmarEliminar(true)}
              disabled={enviando}
              className="admin__ep-remove"
            >
              Eliminar radialista
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button type="button" onClick={handleGuardar} disabled={enviando} className="admin__btn">
            {enviando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear radialista"}
          </button>
        </div>
      </div>

      {radialista && (
        <ConfirmDialog
          open={confirmarEliminar}
          title="Eliminar radialista"
          message={`¿Eliminar a ${radialista.nombre} de radialistas? Esta acción no se puede deshacer.`}
          pending={enviando}
          onCancel={() => setConfirmarEliminar(false)}
          onConfirm={handleEliminar}
        />
      )}
    </div>
  );
}
