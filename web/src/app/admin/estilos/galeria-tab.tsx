"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { ImagenGaleria } from "@/lib/galeria";
import { MAX_IMAGENES_GALERIA, calcularRepeticionesGaleria, calcularDuracionGaleria } from "@/lib/galeria";
import type { GaleriaModo } from "@/lib/estilos";
import { subirImagenGaleria, eliminarImagenGaleria } from "../galeria-actions";
import { actualizarModoGaleria } from "../estilos-actions";
import { ConfirmDialog } from "../confirm-dialog";

const TIPOS_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function formatearFecha(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
}

// Misma lógica que galeria-carrusel.tsx (el componente real de la home),
// vía los helpers de @/lib/galeria — así este preview nunca miente sobre
// cómo se ve realmente en el sitio: en modo flechas es una tira de varias
// fotos a la vez (no una foto grande sola), a todo el ancho disponible y
// sin gap. Clases propias (admin__galeria-preview-* en admin.css) en vez de
// las de ondas.css, mismo criterio que el preview de la cinta.
function GaleriaPreview({ imagenes, modo }: { imagenes: ImagenGaleria[]; modo: GaleriaModo }) {
  if (imagenes.length === 0) {
    return <p className="admin__ep-list-empty">Subí alguna foto para ver el preview.</p>;
  }
  return modo === "manual" ? (
    <GaleriaPreviewManual imagenes={imagenes} />
  ) : (
    <GaleriaPreviewAuto imagenes={imagenes} />
  );
}

function GaleriaPreviewAuto({ imagenes }: { imagenes: ImagenGaleria[] }) {
  const repeticiones = calcularRepeticionesGaleria(imagenes.length);
  const mitad = Array.from({ length: repeticiones }, () => imagenes).flat();
  const doble = [...mitad, ...mitad];
  const duracionSeg = calcularDuracionGaleria(imagenes.length);

  return (
    <div className="admin__galeria-preview--auto">
      <div className="admin__galeria-preview-track" style={{ animationDuration: `${duracionSeg}s` }}>
        {doble.map((img, i) => (
          <div className="admin__galeria-preview-item" key={`${img.id}-${i}`}>
            <Image src={img.url} alt="" fill className="object-cover" unoptimized />
          </div>
        ))}
      </div>
    </div>
  );
}

// Igual que GaleriaManual en galeria-carrusel.tsx: "hay más para ver" y
// "llegué al final" se leen del scroll real (scrollWidth/clientWidth/
// scrollLeft), no de una cuenta propia — evita que la flecha quede
// habilitada un click de más.
function GaleriaPreviewManual({ imagenes }: { imagenes: ImagenGaleria[] }) {
  const total = imagenes.length;
  const viewportRef = useRef<HTMLDivElement>(null);
  const primerItemRef = useRef<HTMLDivElement>(null);
  const [hayNavegacion, setHayNavegacion] = useState(false);
  const [alInicio, setAlInicio] = useState(true);
  const [alFinal, setAlFinal] = useState(true);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    function actualizarEstado() {
      if (!viewport) return;
      const maxScroll = viewport.scrollWidth - viewport.clientWidth;
      setHayNavegacion(maxScroll > 1);
      setAlInicio(viewport.scrollLeft <= 1);
      setAlFinal(viewport.scrollLeft >= maxScroll - 1);
    }

    actualizarEstado();
    window.addEventListener("resize", actualizarEstado);
    return () => window.removeEventListener("resize", actualizarEstado);
  }, [total]);

  function actualizarEstadoDesdeScroll() {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    setAlInicio(viewport.scrollLeft <= 1);
    setAlFinal(viewport.scrollLeft >= maxScroll - 1);
  }

  function desplazar(direccion: 1 | -1) {
    const viewport = viewportRef.current;
    const item = primerItemRef.current;
    if (!viewport || !item) return;
    const anchoItem = item.getBoundingClientRect().width;
    viewport.scrollBy({ left: direccion * anchoItem, behavior: "smooth" });
  }

  return (
    <div className="admin__galeria-preview--manual">
      <div className="admin__galeria-preview-strip">
        <div className="admin__galeria-preview-viewport" ref={viewportRef} onScroll={actualizarEstadoDesdeScroll}>
          <div className={cx("admin__galeria-preview-viewport-row", !hayNavegacion && "is-centrado")}>
            {imagenes.map((img, i) => (
              <div
                className="admin__galeria-preview-item"
                key={img.id}
                ref={i === 0 ? primerItemRef : undefined}
              >
                <Image src={img.url} alt="" fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        </div>
        {hayNavegacion && (
          <button
            type="button"
            className="admin__galeria-preview-arrow admin__galeria-preview-arrow--prev"
            onClick={() => desplazar(-1)}
            disabled={alInicio}
            aria-label="Fotos anteriores"
          >
            ‹
          </button>
        )}
        {hayNavegacion && (
          <button
            type="button"
            className="admin__galeria-preview-arrow admin__galeria-preview-arrow--next"
            onClick={() => desplazar(1)}
            disabled={alFinal}
            aria-label="Fotos siguientes"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}

export function GaleriaTab({
  imagenesIniciales,
  modoInicial,
}: {
  imagenesIniciales: ImagenGaleria[];
  modoInicial: GaleriaModo;
}) {
  const [imagenes, setImagenes] = useState(imagenesIniciales);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [imagenAEliminar, setImagenAEliminar] = useState<{ id: string; nombre: string } | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [modo, setModo] = useState<GaleriaModo>(modoInicial);
  const [guardandoModo, setGuardandoModo] = useState(false);
  const [errorModo, setErrorModo] = useState<string | null>(null);

  const espacioDisponible = MAX_IMAGENES_GALERIA - imagenes.length;

  async function handleCambiarModo(nuevo: GaleriaModo) {
    if (nuevo === modo || guardandoModo) return;
    setErrorModo(null);
    setGuardandoModo(true);
    const anterior = modo;
    setModo(nuevo);
    const resultado = await actualizarModoGaleria(nuevo);
    setGuardandoModo(false);
    if (resultado?.error) {
      setModo(anterior);
      setErrorModo(resultado.error);
    }
  }

  async function handleArchivos(files: FileList | null) {
    setError(null);
    if (!files || files.length === 0) return;

    const lista = Array.from(files);

    if (lista.length > espacioDisponible) {
      setError(
        espacioDisponible > 0
          ? `Solo podés agregar ${espacioDisponible} imagen${espacioDisponible === 1 ? "" : "es"} más (máximo ${MAX_IMAGENES_GALERIA}).`
          : `La galería ya tiene el máximo de ${MAX_IMAGENES_GALERIA} imágenes.`
      );
      setInputKey((k) => k + 1);
      return;
    }

    for (const archivo of lista) {
      if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
        setError(`"${archivo.name}" no es PNG, JPG ni WEBP.`);
        setInputKey((k) => k + 1);
        return;
      }
      if (archivo.size > MAX_BYTES) {
        setError(`"${archivo.name}" pesa más de 5MB.`);
        setInputKey((k) => k + 1);
        return;
      }
    }

    setSubiendo(true);
    for (const archivo of lista) {
      const formData = new FormData();
      formData.set("archivo", archivo);
      const resultado = await subirImagenGaleria(formData);
      if ("error" in resultado) {
        setError(resultado.error);
        break;
      }
      setImagenes((prev) => [resultado.imagen, ...prev]);
    }
    setSubiendo(false);
    setInputKey((k) => k + 1);
  }

  async function confirmarEliminarAhora() {
    if (!imagenAEliminar) return;
    setEliminandoId(imagenAEliminar.id);
    const resultado = await eliminarImagenGaleria(imagenAEliminar.id);
    setEliminandoId(null);
    if (resultado?.error) {
      setError(resultado.error);
      setImagenAEliminar(null);
      return;
    }
    setImagenes((prev) => prev.filter((img) => img.id !== imagenAEliminar.id));
    setImagenAEliminar(null);
  }

  return (
    <div className="admin__form">
      <p className="admin__hint" style={{ display: "block", marginBottom: "1rem" }}>
        Fotos para el carrusel de la home, entre la cinta y &quot;Últimos episodios&quot;. Máximo{" "}
        {MAX_IMAGENES_GALERIA} imágenes, PNG/JPG/WEBP, hasta 5MB cada una.
      </p>

      <div className="admin__field">
        <span>Movimiento en el sitio</span>
        <div className="admin__toggle">
          <button
            type="button"
            onClick={() => handleCambiarModo("auto")}
            aria-pressed={modo === "auto"}
            disabled={guardandoModo}
          >
            Automático
          </button>
          <button
            type="button"
            onClick={() => handleCambiarModo("manual")}
            aria-pressed={modo === "manual"}
            disabled={guardandoModo}
          >
            Con flechas
          </button>
        </div>
        <p className="admin__hint" style={{ display: "block", marginTop: ".3rem" }}>
          {modo === "auto"
            ? "Se desliza sola, mucho más lento que la cinta."
            : "El visitante navega con flechas; se muestran hasta 3 puntos de posición."}
        </p>
      </div>
      {errorModo && <p className="admin__error">{errorModo}</p>}

      <div className="admin__field">
        <span>Vista previa</span>
        <GaleriaPreview imagenes={imagenes} modo={modo} />
      </div>

      <label className="admin__field">
        <span>
          Agregar fotos ({imagenes.length}/{MAX_IMAGENES_GALERIA})
        </span>
        <input
          key={inputKey}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          disabled={subiendo || espacioDisponible <= 0}
          onChange={(e) => handleArchivos(e.target.files)}
        />
        {subiendo && <span className="admin__hint">Subiendo…</span>}
      </label>

      {error && <p className="admin__error">{error}</p>}

      {imagenes.length === 0 ? (
        <p className="admin__ep-list-empty">Todavía no hay imágenes en la galería.</p>
      ) : (
        <table className="admin__table">
          <thead>
            <tr>
              <th></th>
              <th>Nombre</th>
              <th>Subida</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {imagenes.map((img) => (
              <tr key={img.id}>
                <td>
                  <div className="admin__thumb">
                    <Image src={img.url} alt="" fill className="object-cover" unoptimized />
                  </div>
                </td>
                <td>{img.nombre}</td>
                <td>{formatearFecha(img.creadoEn)}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => setImagenAEliminar({ id: img.id, nombre: img.nombre })}
                    disabled={eliminandoId === img.id}
                    className="admin__ep-remove"
                  >
                    {eliminandoId === img.id ? "Eliminando…" : "Eliminar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmDialog
        open={imagenAEliminar !== null}
        title="Eliminar imagen"
        message={`¿Eliminar "${imagenAEliminar?.nombre}" de la galería? No se puede deshacer.`}
        pending={eliminandoId !== null}
        onConfirm={confirmarEliminarAhora}
        onCancel={() => setImagenAEliminar(null)}
      />
    </div>
  );
}
