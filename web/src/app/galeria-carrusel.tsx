"use client";

import { useEffect, useRef, useState } from "react";
import type { ImagenGaleria } from "@/lib/galeria";
import { calcularRepeticionesGaleria, calcularDuracionGaleria } from "@/lib/galeria";
import type { GaleriaModo } from "@/lib/estilos";

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function GaleriaCarrusel({
  imagenes,
  modo,
}: {
  imagenes: ImagenGaleria[];
  modo: GaleriaModo;
}) {
  if (imagenes.length === 0) return null;
  return modo === "manual" ? <GaleriaManual imagenes={imagenes} /> : <GaleriaAuto imagenes={imagenes} />;
}

// Modo "auto": cinta continua, mismo mecanismo que .ticker (dos mitades
// idénticas + translateX -50%) pero mucho más lenta, a todo el ancho sin
// gap entre fotos. Repetir acá es lo esperable (toda cinta que loopea
// repite su contenido), así que no hace falta el manejo especial de "pocas
// fotos" del modo flechas — se pausa al pasar el mouse para poder mirar
// una foto sin que seescape.
function GaleriaAuto({ imagenes }: { imagenes: ImagenGaleria[] }) {
  const repeticiones = calcularRepeticionesGaleria(imagenes.length);
  const mitad = Array.from({ length: repeticiones }, () => imagenes).flat();
  const doble = [...mitad, ...mitad];
  const duracionSeg = calcularDuracionGaleria(imagenes.length);

  return (
    <div className="galeria galeria--auto">
      <div className="galeria__track" style={{ animationDuration: `${duracionSeg}s` }}>
        {doble.map((img, i) => (
          <div className="galeria__item" key={`${img.id}-${i}`}>
            <img src={img.url} alt="" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Modo "manual": tira de varias fotos a la vez (a todo el ancho, sin gap),
// que el visitante desplaza de a una foto con las flechas. Acá cada foto es
// contenido real (portada de programa, no relleno decorativo): si no
// alcanzan para llenar la pantalla, NO se repiten — se centran, con el
// espacio de sobra como negative space intencional en vez de un hueco que
// se lea como error.
//
// "Hay más para ver" y "llegué al final" se leen directo del scroll real
// del navegador (scrollWidth/clientWidth/scrollLeft), no de una cuenta
// propia de cuántas fotos "deberían" entrar — un cálculo aproximado
// (Math.floor del ancho) podía quedar desalineado con el clamp real que ya
// hace el navegador, dejando la flecha habilitada un click de más aunque
// las fotos ya no se movieran.
function GaleriaManual({ imagenes }: { imagenes: ImagenGaleria[] }) {
  const total = imagenes.length;
  const viewportRef = useRef<HTMLDivElement>(null);
  const primerItemRef = useRef<HTMLDivElement>(null);
  // Arranca asumiendo que no hace falta navegar (sin flechas): evita el
  // flash de mostrarlas de entrada para ocultarlas apenas se mide.
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
    <div className="galeria galeria--manual">
      <div className="galeria__strip">
        <div className="galeria__viewport" ref={viewportRef} onScroll={actualizarEstadoDesdeScroll}>
          <div className={cx("galeria__row", !hayNavegacion && "galeria__row--centrado")}>
            {imagenes.map((img, i) => (
              <div className="galeria__item" key={img.id} ref={i === 0 ? primerItemRef : undefined}>
                <img src={img.url} alt="" />
              </div>
            ))}
          </div>
        </div>
        {hayNavegacion && (
          <button
            type="button"
            className="galeria__arrow galeria__arrow--prev"
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
            className="galeria__arrow galeria__arrow--next"
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
