"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Animación de entrada tomada de docs/ondas-disidentes-base.html (el HTML
// de referencia del proyecto): una "prepágina" estilo consola (gate) que
// al hacer click/Enter/espacio dispara una secuencia de "arranque" (boot)
// antes de revelar la home.
//
// Se ve una vez por sesión de navegador, no en cada visita: si cierra la
// pestaña y vuelve a entrar (aunque sea al toque), la vuelve a ver — mismo
// criterio que NAV_STORAGE_KEY en home-client.tsx (sessionStorage, no
// localStorage).
const GATE_STORAGE_KEY = "ondas-gate-visto";

// Textos y timing tal cual el HTML de referencia (líneas 401-407 y
// enterHome() en docs/ondas-disidentes-base.html) — no inventados acá.
const BOOT_LINEAS: { texto: string; delay: number; clase?: string }[] = [
  { texto: "> Ondas Disidentes", delay: 0 },
  { texto: "> Radio alternativa", delay: 260 },
  { texto: "> Buscando señal . . .", delay: 560 },
  { texto: "> Señal adquirida [OK]", delay: 980, clase: "boot__ok" },
];
// La última línea lleva markup propio (spans .hm/.fx), va aparte del resto.
const BOOT_LINEA_FINAL_DELAY = 1300;
const BOOT_DURACION_MS = 1750; // cuándo arranca el reveal, ver enterHome()
const GATE_FADE_MS = 480; // .gate{transition:opacity .45s ease} + margen

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function formatearHoraBolivia(): string {
  try {
    return new Intl.DateTimeFormat("es-BO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "America/La_Paz",
    }).format(new Date());
  } catch {
    const d = new Date();
    return [d.getHours(), d.getMinutes(), d.getSeconds()].map((x) => String(x).padStart(2, "0")).join(":");
  }
}

export default function EntradaGate({ enVivo }: { enVivo: boolean }) {
  // Arranca visible tanto en el servidor como en el primer render del
  // cliente (tienen que coincidir para no romper la hidratación) — es el
  // caso correcto por defecto para una visita nueva. El layout effect de
  // abajo la oculta ANTES del primer paint real si sessionStorage dice que
  // ya se vio en esta sesión, así que quien vuelve a entrar no ve ningún
  // flash — mismo criterio que "hidratado" en home-client.tsx.
  const [mostrarGate, setMostrarGate] = useState(true);
  const [gateSaliendo, setGateSaliendo] = useState(false);
  const [mostrarBoot, setMostrarBoot] = useState(false);
  const [lineasVisibles, setLineasVisibles] = useState(() => BOOT_LINEAS.map(() => false));
  const [lineaFinalVisible, setLineaFinalVisible] = useState(false);
  const [hora, setHora] = useState("--:--:--");
  const timeoutsRef = useRef<number[]>([]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem(GATE_STORAGE_KEY) === "1") {
        setMostrarGate(false);
      }
    } catch {
      // sessionStorage no disponible (modo privado, cuota, etc.) — se
      // muestra igual, no es crítico.
    }
    // Solo al montar: es una verificación única, no una sincronización continua.
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Reloj: se suscribe a un reloj externo real (Date), no a estado de
  // React, así que el setState inmediato antes del setInterval es
  // legítimo — sin él, el reloj mostraría "--:--:--" un segundo entero de
  // más al abrir el gate.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!mostrarGate) return;
    setHora(formatearHoraBolivia());
    const id = setInterval(() => setHora(formatearHoraBolivia()), 1000);
    return () => clearInterval(id);
  }, [mostrarGate]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  function cerrarGate() {
    setMostrarBoot(false);
    setGateSaliendo(true);
    const id = window.setTimeout(() => setMostrarGate(false), GATE_FADE_MS);
    timeoutsRef.current.push(id);
  }

  function entrar() {
    if (!mostrarGate || gateSaliendo || mostrarBoot) return;

    try {
      sessionStorage.setItem(GATE_STORAGE_KEY, "1");
    } catch {
      // no crítico
    }

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      cerrarGate();
      return;
    }

    setMostrarBoot(true);
    BOOT_LINEAS.forEach((linea, i) => {
      const id = window.setTimeout(() => {
        setLineasVisibles((prev) => prev.map((v, idx) => (idx === i ? true : v)));
      }, linea.delay);
      timeoutsRef.current.push(id);
    });
    const idFinal = window.setTimeout(() => setLineaFinalVisible(true), BOOT_LINEA_FINAL_DELAY);
    const idReveal = window.setTimeout(cerrarGate, BOOT_DURACION_MS);
    timeoutsRef.current.push(idFinal, idReveal);
  }

  if (!mostrarGate) return null;

  return (
    <>
      <div className={cx("gate", gateSaliendo && "go")}>
        <div className="gate__top">
          <div>
            Ondas Disidentes
            <br />
            Radio alternativa
          </div>
          <div className="gate__top-r">
            <time>{hora}</time> Bolivia
          </div>
        </div>

        <div className="gate__mid">
          <span className={cx("gate__status", enVivo && "gate__status--live")}>
            <span className="gate__sq" aria-hidden="true" />
            {enVivo ? "Al aire · En vivo" : "Fuera del aire · En espera"}
          </span>
          <img className="gate__wave" src="/images/gate-wave.webp" alt="" aria-hidden="true" />
          <button type="button" className="gate__play" onClick={entrar}>
            <span aria-hidden="true">►</span>Sintonizar / Entrar
          </button>
        </div>

        <div className="gate__bot">
          <span>Cochabamba · Bolivia</span>
          <span>Voz propia · Herramientas propias · Agenda propia</span>
        </div>
      </div>

      {mostrarBoot && (
        <div className="boot" aria-hidden="true">
          {BOOT_LINEAS.map((linea, i) => (
            <p key={linea.texto} className={cx(lineasVisibles[i] && "show", linea.clase)}>
              {linea.texto}
            </p>
          ))}
          <p className={cx(lineaFinalVisible && "show", "boot__air")}>
            ● <span className="hm">En</span> <span className="fx">vivo</span>
          </p>
        </div>
      )}
    </>
  );
}
